import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Using NewsAPI.ai (Event Registry) instead of NewsAPI.org
    const res = await fetch("https://eventregistry.org/api/v1/article/getArticles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getArticles",
        keyword: "business",
        sourceLocationUri: ["http://en.wikipedia.org/wiki/South_Africa"],
        articlesCount: 3,
        articlesSortBy: "date",
        resultType: "articles",
        apiKey: process.env.NEWSAI_API_KEY
      }),
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    const data = await res.json();
    
    // NewsAPI.ai returns articles inside data.articles.results
    const articles = data.articles?.results || [];

    // Map the NewsAPI.ai format to the format your MarketPulse component expects
    const formattedArticles = articles.map((a: any) => ({
      title: a.title,
      url: a.url,
      source: { name: a.source?.title || "SA Business News" }
    }));

    return NextResponse.json({ articles: formattedArticles });
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}