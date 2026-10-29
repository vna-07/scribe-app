import { NextRequest, NextResponse } from "next/server";

// Gemini model — must be lowercase. Change to "gemini-2.0-flash" or
// "gemini-2.5-flash" if your key was created recently; 1.5-flash is
// retired for newer projects.
const GEMINI_MODEL = "gemini-1.5-flash";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Fallback mock used only for demo / dev when no key or the API fails
    const fallbackMock = {
      merchant: "Spaza Wholesale",
      date: new Date().toISOString().slice(0, 10),
      total: 1450.50,
      items: [
        { description: "White Bread", quantity: 10, amount: 150.00 },
        { description: "Sugar 2kg",    quantity: 5,  amount: 300.00 },
        { description: "Cooking Oil",  quantity: 10, amount: 1000.50 },
      ],
    };

    if (!process.env.GEMINI_API_KEY) {
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json(fallbackMock);
    }

    // Parse the real MIME type from the data URL ("data:image/png;base64,...")
    // so PNG screenshots aren't rejected as JPEG.
    const m = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(image);
    const mimeType = m?.[1] ?? "image/jpeg";
    const base64 = m?.[2] ?? image.split(",")[1];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are a receipt OCR engine. Extract the merchant name, date (YYYY-MM-DD), total amount, and item list. " +
                    "Return ONLY a JSON object with this schema: " +
                    "{ merchant: string, date: string, total: number, items: [{ description: string, quantity: number, amount: number }] }",
                },
                { inlineData: { mimeType, data: base64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
      },
    );

    if (!res.ok) {
      // Don't swallow this — it's how you'll notice bad model names and quota issues.
      console.error("Gemini OCR failed:", res.status, await res.text());
      return NextResponse.json(fallbackMock);
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    try {
      return NextResponse.json(JSON.parse(text));
    } catch (parseErr) {
      console.error("Gemini returned non-JSON:", text);
      return NextResponse.json(fallbackMock);
    }
  } catch (e) {
    console.error("OCR route error:", e);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}