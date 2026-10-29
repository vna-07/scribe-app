"use client";
import { useEffect, useState } from "react";

export default function MarketPulse() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(d => { setNews(d.articles); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />;
  if (!news.length) return null;

  return (
    <div className="bg-[#14173F] text-white rounded-2xl p-5 mb-6 shadow-lg border border-[#2A3070]">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
        </span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A9AEFF]">SA Business Context</h3>
      </div>
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
    </div>
  );
}