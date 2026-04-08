import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const userPrompt = (prompt || "").toLowerCase();

    // --- FUNCIÓN DE RESPALDO (SI FALLA GOOGLE) ---
    const getFallbackDesign = (text: string) => {
      let color = "#dc2626"; // Rojo por defecto
      if (text.includes("azul")) color = "#2563eb";
      if (text.includes("verde")) color = "#16a34a";
      if (text.includes("amarillo") || text.includes("mostaza")) color = "#ca8a04";
      if (text.includes("naranja")) color = "#ea580c";
      if (text.includes("negro") || text.includes("oscuro")) color = "#171717";
      if (text.includes("rosa")) color = "#db2777";

      return {
        color_primario: color,
        bg_color: text.includes("oscuro") || text.includes("negro") ? "#0a0a0a" : "#ffffff",
        hero_titulo: "EL MEJOR SABOR",
        hero_subtitulo: "Calidad premium en cada bocado",
        font_style: text.includes("retro") ? "retro" : "moderno"
      };
    };

    if (!apiKey) {
        return NextResponse.json(getFallbackDesign(userPrompt));
    }

    // Intentamos Gemini una última vez con la URL más genérica
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Responde solo con JSON para una hamburguesería con estilo: ${userPrompt}. Estructura: {"color_primario": "HEX", "bg_color": "HEX", "hero_titulo": "TEXTO", "hero_subtitulo": "TEXTO", "font_style": "moderno"}` }] }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
        }
    } catch (e) {
        console.error("Fallo Gemini, usando fallback");
    }

    // Si llegamos acá es porque Gemini falló, devolvemos el diseño por palabras clave
    return NextResponse.json(getFallbackDesign(userPrompt));

  } catch (error: any) {
    return NextResponse.json({
        color_primario: "#dc2626",
        bg_color: "#ffffff",
        hero_titulo: "BURGER SHOP",
        hero_subtitulo: "El sabor que buscabas",
        font_style: "moderno"
    });
  }
}
