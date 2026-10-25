"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#E9EBFF] dark:bg-[#0E1130]">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 shadow-xl border border-[#E1E4F7] dark:border-[#2A3070]">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo_symbol.png" alt="SCRIBE" width={40} height={40} style={{ width: 'auto', height: 'auto' }} className="rounded-xl" />
          <span className="font-extrabold text-xl text-[#14173F] dark:text-white">SCRIBE</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">Welcome back</h1>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">Sign in to your financial workspace.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none transition-colors"
              placeholder="you@business.co.za"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          {err && <p className="text-sm text-[#B3261E] dark:text-[#FF8A80] font-semibold">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors disabled:opacity-50 shadow-md"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E1E4F7] dark:border-[#2A3070] text-center">
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
            No account?{" "}
            <Link href="/signup" className="text-[#5B5BE0] font-bold hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-xs text-[#5A5F8C] mt-3">
            Judge? Use the demo credentials from the deck.
          </p>
        </div>
      </div>
    </main>
  );
}