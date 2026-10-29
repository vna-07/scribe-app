import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Using NewsAPI.org for fast, simple headlines
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=za&category=business&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour to save API limits
    );
    
    const data = await res.json();
    if (data.status !== "ok") throw new Error(data.message);

    return NextResponse.json({ articles: data.articles });
  } catch (error) {
    console.error("News API Error:", error);
    // Fallback data if the API fails so the demo never breaks
    return NextResponse.json({ 
      articles: [
        { title: "SARB holds interest rates steady at 8.25%", source: { name: "BusinessTech" }, url: "#" },
        { title: "Fuel prices set for a slight drop in November", source: { name: "News24" }, url: "#" },
        { title: "New VAT registration threshold announced for small businesses", source: { name: "SARS" }, url: "#" }
      ] 
    });
  }
}