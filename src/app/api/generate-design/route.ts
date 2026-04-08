import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI("AIzaSyCh2DrQusiYh2ki7sTxWc5X-I6TuHx4bKE");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      Eres un director de arte experto en branding gastronómico y diseño web.
      Tu tarea es recibir la descripción de una hamburguesería y generar una identidad visual y textos de impacto.
      
      Debes responder ÚNICAMENTE con un objeto JSON con la siguiente estructura exacta:
      {
        "color_primario": "HEX_COLOR",
        "bg_color": "HEX_COLOR",
        "hero_titulo": "TITULO_IMPACTANTE",
        "hero_subtitulo": "SUBTITULO_VENDEDOR",
        "font_style": "moderno" | "retro" | "elegante" | "urbano"
      }

      REGLAS:
      - Los colores deben contrastar bien (el texto siempre será blanco o negro sobre el fondo).
      - El título debe ser corto y en MAYÚSCULAS.
      - Solo responde el JSON, nada de texto extra.
    `;

    const result = await model.generateContent([systemPrompt, `Descripción del local: ${prompt}`]);
    const response = await result.response;
    const text = response.text();
    
    // Limpiamos la respuesta por si Gemini agrega markdown
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const design = JSON.parse(jsonStr);

    return NextResponse.json(design);
  } catch (error) {
    console.error("Error Gemini:", error);
    return NextResponse.json({ error: "Fallo al generar diseño" }, { status: 500 });
  }
}
