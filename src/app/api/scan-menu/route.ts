import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { menuText } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    // Usamos gemini-pro que es el que funcionó en las pruebas anteriores
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres un experto en extracción de datos gastronómicos. 
    Recibirás una lista de variedades de hamburguesas y una estructura de precios general.
    
    Tu tarea es aplicar el precio correspondiente a cada variedad y devolver un JSON.
    
    Estructura de respuesta (ARRAY JSON):
    [
      {
        "nombre": "NOMBRE",
        "descripcion": "INGREDIENTES",
        "precio_base": 11000,
        "es_burger": true,
        "variantes": [
          {"nombre": "SIMPLE", "precio": 11000},
          {"nombre": "DOBLE", "precio": 13000},
          {"nombre": "TRIPLE", "precio": 15000}
        ]
      }
    ]

    REGLAS:
    - Si el texto dice "Sin Papas: 11k - 13k - 15k", úsalos como precios base para las variantes Simple, Doble y Triple.
    - La descripción debe ser limpia (sin la palabra "Ingredientes:").
    - Solo responde el ARRAY JSON puro.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nTexto del menú:\n${menuText}` }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error API Google:", data);
      return NextResponse.json({ error: "Error en la API de Google", details: data.error?.message }, { status: 500 });
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
        console.error("Gemini no devolvió JSON válido:", text);
        throw new Error("La IA no devolvió un listado válido");
    }
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error("Error Crítico:", error);
    return NextResponse.json({ error: "Fallo al procesar el menú", details: error.message }, { status: 500 });
  }
}
