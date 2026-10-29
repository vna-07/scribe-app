"use client";
import { useEffect, useState } from "react";

export default function MarketPulse() {
  const [news, setNews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setNews(d.articles || []);
      })
      .catch(e => {
        console.error("Market Pulse Error:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#1A1F52] text-white rounded-2xl p-5 shadow-lg border border-[#2A3070]">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
        </span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A9AEFF]">SA Business Context</h3>
      </div>
      
      {loading ? (
        <p className="text-sm text-[#5A5F8C] animate-pulse">Loading live news...</p>
      ) : error ? (
        <p className="text-sm text-red-400">Error: {error} (Check NEWS_API_KEY)</p>
      ) : news.length === 0 ? (
        <p className="text-sm text-[#5A5F8C]">No news articles found.</p>
      ) : (
        <div className="space-y-3">
          {news.slice(0, 3).map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
              <p className="text-sm font-medium leading-snug group-hover:text-[#B89A61] transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-[#5A5F8C] mt-1">{item.source?.name || "News"}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}