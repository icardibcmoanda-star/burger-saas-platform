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

    const systemPrompt = `Eres un experto en extracción de datos gastronómicos. 
    Analiza el archivo (foto o PDF) o texto adjunto y extrae todos los productos.
    
    Responde EXCLUSIVAMENTE con un array de objetos JSON con esta estructura:
    [
      {
        "nombre": "NOMBRE",
        "descripcion": "INGREDIENTES",
        "precio_base": 12000,
        "es_burger": true,
        "variantes": [
          {"nombre": "SIMPLE", "precio": 10000},
          {"nombre": "DOBLE", "precio": 12000}
        ]
      }
    ]

    REGLAS:
    - Si detectas niveles (Simple/Doble/Triple), inclúyelos en 'variantes'.
    - Si no hay variantes, deja 'variantes' como null.
    - Solo responde el JSON puro.`;

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
