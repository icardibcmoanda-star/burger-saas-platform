import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { menuText } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres un experto en extracción de datos gastronómicos. 
    Tu tarea es recibir un texto desordenado de un menú y convertirlo en un listado de productos estructurado.
    
    Responde EXCLUSIVAMENTE con un array de objetos JSON con esta estructura:
    [
      {
        "nombre": "NOMBRE_PRODUCTO",
        "descripcion": "DESCRIPCION_CORTA",
        "precio_base": 12000,
        "es_burger": true/false
      }
    ]

    REGLAS:
    - Identifica si es hamburguesa por el nombre o contexto.
    - Los precios deben ser números enteros.
    - Si el texto dice "10k", conviértelo a 10000.
    - Solo responde el JSON, sin texto extra.`;

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
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error("Formato inválido");
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    return NextResponse.json({ error: "Fallo al escanear menú" }, { status: 500 });
  }
}
