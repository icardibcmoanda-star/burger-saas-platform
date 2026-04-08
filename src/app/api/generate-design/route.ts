import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = "AIzaSyCh2DrQusiYh2ki7sTxWc5X-I6TuHx4bKE";
    
    // Usamos la URL directa de la API de Google (v1) para máxima estabilidad
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres un experto en branding y diseño web. 
    Responde UNICAMENTE con un objeto JSON (sin texto extra ni markdown):
    {
      "color_primario": "HEX",
      "bg_color": "HEX",
      "hero_titulo": "TEXTO CORTO",
      "hero_subtitulo": "TEXTO VENDEDOR",
      "font_style": "moderno"
    }`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nDescripción del local: ${prompt}` }]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error Gemini Directo:", data);
      return NextResponse.json({ error: "Error en Google API", details: data.error?.message }, { status: 500 });
    }

    const text = data.candidates[0].content.parts[0].text;
    const design = JSON.parse(text);

    return NextResponse.json(design);
  } catch (error: any) {
    console.error("Error Crítico IA:", error);
    return NextResponse.json({ error: "Error de conexión con la IA" }, { status: 500 });
  }
}
