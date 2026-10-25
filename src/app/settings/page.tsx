"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#E9EBFF] p-6 sm:p-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="text-[#5A5F8C] hover:text-[#14173F] dark:text-[#A9AEFF] dark:hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white">Settings</h1>
            <p className="text-sm text-[#4A4F7A] dark:text-[#A9AEFF]">Manage your preferences and account.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-white dark:bg-[#14173F] rounded-[28px] p-8 shadow-sm border border-[#E1E4F7] dark:border-[#2A3070] transition-colors">
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-6">Appearance</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "light", label: "Daylight" },
                { id: "dark", label: "Night" },
                { id: "sunlight", label: "Sunlight" },
                { id: "system", label: "System" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    theme === t.id 
                      ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070] sunlight:border-[#3D3DC4] sunlight:bg-white" 
                      : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF] dark:hover:border-[#5B5BE0]"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-gray-200 ${
                    t.id === 'light' ? 'bg-[#E9EBFF] text-[#14173F]' : 
                    t.id === 'dark' ? 'bg-[#0E1130] text-white' : 
                    t.id === 'sunlight' ? 'bg-white text-[#0A0C2B] border-2 border-[#14173F]' :
                    'bg-gradient-to-tr from-[#E9EBFF] to-[#0E1130]'
                  }`}>
                    {t.id === 'light' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>}
                    {t.id === 'dark' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>}
                    {t.id === 'sunlight' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>}
                    {t.id === 'system' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>}
                  </div>
                  <span className={`font-bold text-xs ${theme === t.id ? "text-[#5B5BE0] dark:text-[#A9AEFF] sunlight:text-[#3D3DC4]" : "text-[#4A4F7A] dark:text-[#A9AEFF] sunlight:text-[#0A0C2B]"}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Language */}
          <section className="bg-white dark:bg-[#14173F] rounded-[28px] p-8 shadow-sm border border-[#E1E4F7] dark:border-[#2A3070] transition-colors">
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-6">Language</h2>
            <select className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white font-bold outline-none focus:border-[#5B5BE0] transition-colors appearance-none">
              <option value="en">English</option>
              <option value="xh">isiXhosa (Coming soon)</option>
              <option value="zu">isiZulu (Coming soon)</option>
              <option value="af">Afrikaans (Coming soon)</option>
            </select>
          </section>

        </div>
      </div>
    </div>
  );
}