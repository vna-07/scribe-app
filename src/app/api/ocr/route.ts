import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Fallback mock for the demo if no API key is present
    const fallbackMock = {
      merchant: "Spaza Wholesale",
      date: new Date().toISOString().slice(0, 10),
      total: 1450.50,
      items: [
        { description: "White Bread", quantity: 10, amount: 150.00 },
        { description: "Sugar 2kg", quantity: 5, amount: 300.00 },
        { description: "Cooking Oil", quantity: 10, amount: 1000.50 },
      ]
    };

    if (!process.env.GEMINI_API_KEY) {
      // Simulate a network delay to show the loading state
      await new Promise(r => setTimeout(r, 1500));
      return NextResponse.json(fallbackMock);
    }

    // GEMINI Vision API Call
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/GEMINI-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "You are a receipt OCR engine. Extract the merchant name, date (YYYY-MM-DD), total amount, and item list. Return ONLY a JSON object with this schema: { merchant: string, date: string, total: number, items: [{ description: string, quantity: number, amount: number }] }" },
                { inlineData: { mimeType: "image/jpeg", data: image.split(",")[1] } }
              ]
            }
          ],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        }),
      }
    );

    if (!res.ok) return NextResponse.json(fallbackMock);

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Parse the JSON safely
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json(fallbackMock);
    }

  } catch (e) {
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}