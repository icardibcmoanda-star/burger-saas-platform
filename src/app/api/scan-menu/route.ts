import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { file, fileType, text } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Falta API Key" }, { status: 500 });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `ACTÚA COMO UN OCR AVANZADO. Extrae todos los productos y precios de este menú. 
    Responde EXCLUSIVAMENTE con un array JSON de objetos: [{"nombre": "...", "descripcion": "...", "precio_base": 0, "es_burger": true, "variantes": null}]. 
    Si hay Simple/Doble/Triple, ponelos en variantes. Si no encontrás nada, devolvé un array vacío [].`;

    const body = {
      contents: [{
        parts: [
          { text: promptText },
          file ? { inline_data: { mime_type: fileType, data: file } } : { text: `Texto: ${text}` }
        ]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Google API Error:", data);
        return NextResponse.json({ error: "Error de Google", details: data.error?.message }, { status: 500 });
    }

    const resultText = data.candidates[0].content.parts[0].text;
    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
        console.log("Gemini Raw Output (No JSON):", resultText);
        throw new Error("La IA no pudo estructurar los datos. Asegúrate que la foto sea clara.");
    }
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    return NextResponse.json({ error: "Fallo al escanear", details: error.message }, { status: 500 });
  }
}
