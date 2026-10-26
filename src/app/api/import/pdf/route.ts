import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pdf_base64 } = await req.json();

    if (!pdf_base64) {
      return NextResponse.json({ error: "No PDF provided" }, { status: 400 });
    }

    // Strip data URI prefix if present
    const cleanBase64 = pdf_base64.includes(",") ? pdf_base64.split(",")[1] : pdf_base64;

    // If no API key, return a structured error that the UI can explain
    if (!process.env.GEMINI_API_KEY && !process.env.key) {
      return NextResponse.json(
        { error: "PDF extraction is unavailable. Try CSV or XLSX instead." },
        { status: 503 }
      );
    }

    const apiKey = process.env.key || process.env.GEMINI_API_KEY;

    const prompt = `You are a document reader for a business record-keeping app.
Extract every transaction, sale, expense, or line item visible in this PDF.

Return ONLY valid JSON in this exact structure (no markdown, no backticks):
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "what the transaction was for",
      "amount": 123.45,
      "type": "sale" | "expense",
      "quantity": 2
    }
  ],
  "notes": "brief note about confidence or missing fields (optional)"
}

Rules:
- Use positive numbers for amounts. Type "sale" or "expense" determines direction.
- If a date is unclear, use today's date.
- If quantity is unknown, set it to null.
- If nothing transaction-like is visible, return {"transactions": [], "notes": "No transactions found"}.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: "application/pdf", data: cleanBase64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[PDF Extract] Gemini error:", res.status, errText.slice(0, 300));
      return NextResponse.json(
        { error: `PDF extraction failed (${res.status}). Try CSV or XLSX.` },
        { status: 502 }
      );
    }

    const json = await res.json();
    let text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }

    text = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("[PDF Extract] Exception:", e.message);
    return NextResponse.json({ error: "PDF processing failed" }, { status: 500 });
  }
}