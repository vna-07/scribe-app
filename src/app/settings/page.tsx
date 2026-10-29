
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LOCALES } from "@/lib/i18n/dictionary";
import TelegramLink from "@/components/TelegramLink";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Dynamic back: return to wherever the user came from, falling back
  // to /dashboard if there's no history (e.g. direct navigation / bookmark).
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[#E9EBFF] dark:bg-[#0E1130] p-6 sm:p-12 transition-colors duration-300 outline-none"
    >
      <div className="max-w-3xl mx-auto">

        {/* Header with dynamic back navigation */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="text-[#5A5F8C] hover:text-[#14173F] dark:text-[#A9AEFF] dark:hover:text-white transition-colors"
          >
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white">{t("settings.title")}</h1>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">{t("settings.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-white dark:bg-[#14173F] rounded-[28px] p-8 shadow-sm border border-[#E1E4F7] dark:border-[#2A3070] transition-colors">
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-6">{t("settings.appearance")}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "light", labelKey: "settings.theme.light" },
                { id: "dark", labelKey: "settings.theme.dark" },
                { id: "sunlight", labelKey: "settings.theme.sunlight" },
                { id: "system", labelKey: "settings.theme.system" },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  aria-pressed={theme === th.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    theme === th.id
                      ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070] sunlight:border-[#3D3DC4] sunlight:bg-white"
                      : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF] dark:hover:border-[#5B5BE0]"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-gray-200 ${
                    th.id === "light" ? "bg-[#E9EBFF] text-[#14173F]"
                    : th.id === "dark" ? "bg-[#0E1130] text-white"
                    : th.id === "sunlight" ? "bg-white text-[#0A0C2B] border-2 border-[#14173F]"
                    : "bg-gradient-to-tr from-[#E9EBFF] to-[#0E1130]"
                  }`}>
                    {th.id === "light" && <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>}
                    {th.id === "dark" && <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>}
                    {th.id === "sunlight" && <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>}
                    {th.id === "system" && <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>}
                  </div>
                  <span className={`font-bold text-xs ${theme === th.id ? "text-[#5B5BE0] dark:text-[#A9AEFF] sunlight:text-[#3D3DC4]" : "text-[#4A4F7A] dark:text-[#A9AEFF] sunlight:text-[#0A0C2B]"}`}>
                    {t(th.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Language */}
          <section className="bg-white dark:bg-[#14173F] rounded-[28px] p-8 shadow-sm border border-[#E1E4F7] dark:border-[#2A3070]">
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-2">{t("settings.language")}</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">
              UI strings and Themba responses will use the selected language. English is the fallback.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LOCALES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  aria-pressed={locale === l.code}
                  className={`p-4 rounded-xl border-2 text-sm font-bold transition-colors ${
                    locale === l.code
                      ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF]"
                      : "border-[#E1E4F7] dark:border-[#2A3070] text-[#4A4F7A] dark:text-[#C5C9F5] hover:border-[#A9AEFF]"
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </section>

          {/* Telegram linking */}
          <TelegramLink />
        </div>
      </div>
    </main>
  );
}