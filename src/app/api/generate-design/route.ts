import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY; // Usamos la variable segura de Vercel
    
    if (!apiKey) {
      return NextResponse.json({ error: "Falta configurar la API Key en Vercel" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres un experto en branding y diseño web. 
    Responde EXCLUSIVAMENTE con un objeto JSON válido.
    
    Estructura:
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
          parts: [{ text: `${systemPrompt}\n\nDescripción del usuario: ${prompt}` }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Error en Google", details: data.error?.message }, { status: 500 });
    }

    let text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La IA no devolvió un formato válido");
    
    const design = JSON.parse(jsonMatch[0]);
    return NextResponse.json(design);
  } catch (error: any) {
    return NextResponse.json({ error: "Fallo al procesar con IA" }, { status: 500 });
  }
}
