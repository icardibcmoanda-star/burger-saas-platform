import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.json(); // Cambiaremos a recibir base64 para simplificar
    const { file, fileType, text } = formData;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `ACTÚA COMO UN OCR AVANZADO Y EXPERTO GASTRONÓMICO.
    TU MISIÓN ES EXTRAER CADA PLATO, BEBIDA O ACOMPAÑAMIENTO DEL DOCUMENTO ADJUNTO.
    
    INSTRUCCIONES OBLIGATORIAS:
    1. Escanea todo el documento buscando Nombres de productos y Precios.
    2. Si ves una lista de variedades (ej: Simple, Doble, Triple), agrúpalas como variantes.
    3. Si el precio no está claro, estima uno razonable basado en el contexto o pon 0.
    4. Ignora textos decorativos, direcciones o logos.
    
    RESPONDE ÚNICAMENTE CON UN ARRAY JSON PURO:
    [
      {
        "nombre": "NOMBRE DEL PRODUCTO",
        "descripcion": "INGREDIENTES O DETALLES",
        "precio_base": 15000,
        "es_burger": true,
        "variantes": [
          {"nombre": "SIMPLE", "precio": 13000},
          {"nombre": "DOBLE", "precio": 15000}
        ]
      }
    ]
    
    REGLA DE ORO: SI NO ENCUENTRAS VARIANTES, "variantes" DEBE SER NULL.`;

    let body;
    if (file) {
        // Si hay archivo, enviamos el contenido multimedia
        body = {
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { inline_data: { mime_type: fileType, data: file } }
                ]
            }]
        };
    } else {
        // Si es solo texto
        body = {
            contents: [{
                parts: [{ text: `${systemPrompt}\n\nTexto:\n${text}` }]
            }]
        };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error("No se detectó un menú válido");
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error("Error Scanner:", error);
    return NextResponse.json({ error: "Fallo al procesar el menú", details: error.message }, { status: 500 });
  }
}
