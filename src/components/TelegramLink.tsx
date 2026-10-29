"use client";

import { useCallback, useEffect, useState } from "react";

type LinkStatus = {
  linked: boolean;
  chatId?: string | null;
  linkedAt?: number | null;
  code?: string | null;
  expiresAt?: number | null;
};

function maskChatId(id: string) {
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}…${id.slice(-3)}`;
}

export default function TelegramLink() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "ScribeIntellegenceBot";

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/telegram/link", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      setStatus(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 1-second ticker while a code is pending (for the countdown).
  useEffect(() => {
    if (!status?.expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status?.expiresAt]);

  // When the code expires, refresh (which also picks up the "linked" state
  // if the user actually completed the link on Telegram in the meantime).
  useEffect(() => {
    if (!status?.expiresAt) return;
    if (status.expiresAt <= now) refresh();
  }, [now, status?.expiresAt, refresh]);

  async function generateCode() {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/link", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not generate a linking code");
      }
      setStatus(await res.json());
      setNow(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  async function unlink() {
    if (!confirm("Unlink this Telegram account?")) return;
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/link", { method: "DELETE" });
      if (!res.ok) throw new Error("Could not unlink");
      setStatus(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  const codeActive =
    !!status?.code && !!status.expiresAt && status.expiresAt > now;
  const secondsLeft = status?.expiresAt
    ? Math.max(0, Math.floor((status.expiresAt - now) / 1000))
    : 0;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <section className="bg-white dark:bg-[#14173F] rounded-[28px] p-8 shadow-sm border border-[#E1E4F7] dark:border-[#2A3070]">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">
            Telegram
          </h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mt-1">
            Link Telegram to log sales, expenses and ask Themba questions
            straight from your phone.
          </p>
        </div>
        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
            status?.linked
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "bg-[#F1F2FF] text-[#5B5BE0] dark:bg-[#2A3070] dark:text-[#A9AEFF]"
          }`}
        >
          {loading ? "…" : status?.linked ? "Linked" : "Not linked"}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
          Loading…
        </p>
      ) : status?.linked ? (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
            Connected to chat{" "}
            <span className="font-mono font-bold text-[#14173F] dark:text-white">
              {status.chatId ? maskChatId(status.chatId) : "unknown"}
            </span>
            {status.linkedAt
              ? ` · since ${new Date(status.linkedAt).toLocaleDateString()}`
              : null}
          </p>
          <button
            onClick={unlink}
            disabled={working}
            className="px-4 py-2 rounded-xl border-2 border-[#E1E4F7] dark:border-[#2A3070] text-[#4A4F7A] dark:text-[#C5C9F5] font-bold text-sm hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {working ? "Unlinking…" : "Unlink"}
          </button>
        </div>
      ) : codeActive ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-[#F1F2FF] dark:bg-[#2A3070] p-6 text-center">
            <div className="text-xs uppercase tracking-wider text-[#5B5BE0] dark:text-[#A9AEFF] font-bold mb-2">
              Your linking code
            </div>
            <div className="text-4xl font-extrabold tracking-[0.25em] text-[#14173F] dark:text-white font-mono">
              {status!.code}
            </div>
            <div className="mt-2 text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">
              Expires in {mm}:{ss}
            </div>
          </div>

          <ol className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] space-y-1 list-decimal list-inside">
            <li>
              Open Telegram and message{" "}
              <span className="font-bold text-[#14173F] dark:text-white">
                @{botUsername}
              </span>
            </li>
            <li>
              Send{" "}
              <span className="font-mono font-bold">
                /link {status!.code}
              </span>
            </li>
            <li>Come back here — this card updates automatically</li>
          </ol>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={refresh}
              className="px-4 py-2 rounded-xl bg-[#5B5BE0] text-white font-bold text-sm hover:bg-[#3D3DC4] sunlight:bg-[#3D3DC4] sunlight:hover:bg-[#5B5BE0] transition-colors"
            >
              I&apos;ve linked it
            </button>
            <button
              onClick={generateCode}
              disabled={working}
              className="px-4 py-2 rounded-xl border-2 border-[#E1E4F7] dark:border-[#2A3070] text-[#4A4F7A] dark:text-[#C5C9F5] font-bold text-sm hover:border-[#A9AEFF] transition-colors disabled:opacity-50"
            >
              New code
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={generateCode}
            disabled={working}
            className="px-5 py-3 rounded-xl bg-[#5B5BE0] text-white font-bold text-sm hover:bg-[#3D3DC4] sunlight:bg-[#3D3DC4] sunlight:hover:bg-[#5B5BE0] transition-colors disabled:opacity-50"
          >
            {working ? "Generating…" : "Generate linking code"}
          </button>
        </div>
      )}
    </section>
  );
}