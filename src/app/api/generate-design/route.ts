import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI("AIzaSyCh2DrQusiYh2ki7sTxWc5X-I6TuHx4bKE");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No se proporcionó un prompt" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      Eres un director de arte experto en branding gastronómico y diseño web.
      Recibirás la descripción de una hamburguesería y generarás una identidad visual y textos de impacto.
      
      Responde EXCLUSIVAMENTE con un objeto JSON válido (sin texto antes ni después) con esta estructura:
      {
        "color_primario": "HEX_COLOR",
        "bg_color": "HEX_COLOR",
        "hero_titulo": "TITULO_IMPACTANTE",
        "hero_subtitulo": "SUBTITULO_VENDEDOR",
        "font_style": "moderno"
      }

      REGLAS CRÍTICAS:
      - El JSON debe ser válido.
      - Los colores deben ser legibles.
      - El título debe ser corto.
    `;

    const result = await model.generateContent([systemPrompt, `Descripción: ${prompt}`]);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extraer JSON usando regex por si Gemini manda texto extra
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No se encontró JSON en la respuesta");
      
      const design = JSON.parse(jsonMatch[0]);
      return NextResponse.json(design);
    } catch (parseError) {
      console.error("Error parseando JSON de Gemini:", text);
      return NextResponse.json({ error: "La IA devolvió un formato inválido", raw: text }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error Gemini API:", error);
    return NextResponse.json({ 
      error: "Error en la API de Gemini", 
      details: error.message || "Error desconocido"
    }, { status: 500 });
  }
}
