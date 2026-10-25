import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Image from "next/image";

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  // Security Chokepoint: Kick non-admins out immediately
  if (!user || user.is_admin !== 1) {
    redirect("/login");
  }

  // Fetch Platform Metrics
  const userCount = await db().execute("SELECT COUNT(*) as c FROM users");
  const bizCount = await db().execute("SELECT COUNT(*) as c FROM businesses");
  const recCount = await db().execute("SELECT COUNT(*) as c FROM records");
  
  // Fetch latest audit logs
  const logsRes = await db().execute({
    sql: "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 15"
  });

  const stats = {
    users: Number(userCount.rows[0].c),
    businesses: Number(bizCount.rows[0].c),
    records: Number(recCount.rows[0].c),
  };

  return (
    <div className="min-h-screen bg-[#0E1130] text-white p-6 sm:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-[#2A3070] pb-6">
          <div className="flex items-center gap-4">
            <Image src="/logo_symbol.png" alt="SCRIBE" width={40} height={40} style={{ width: 'auto', height: 'auto' }} className="rounded-xl bg-[#1A1F52] p-1" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">Trust Centre</h1>
              <p className="text-sm text-[#A9AEFF]">Admin & Security Console</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-[#A9AEFF] hover:text-white transition-colors">
            Exit Admin →
          </Link>
        </div>

        {/* Platform Health KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#1A1F52] rounded-2xl p-6 border border-[#2A3070]">
            <p className="text-xs font-bold text-[#C5C9F5] uppercase tracking-wider mb-1">Registered Users</p>
            <p className="text-3xl font-extrabold tabular-nums">{stats.users}</p>
          </div>
          <div className="bg-[#1A1F52] rounded-2xl p-6 border border-[#2A3070]">
            <p className="text-xs font-bold text-[#C5C9F5] uppercase tracking-wider mb-1">Active Businesses</p>
            <p className="text-3xl font-extrabold tabular-nums">{stats.businesses}</p>
          </div>
          <div className="bg-[#1A1F52] rounded-2xl p-6 border border-[#2A3070]">
            <p className="text-xs font-bold text-[#C5C9F5] uppercase tracking-wider mb-1">Sealed Ledger Records</p>
            <p className="text-3xl font-extrabold tabular-nums">{stats.records}</p>
          </div>
        </div>

        {/* Live Audit Log */}
        <div className="bg-[#1A1F52] rounded-2xl border border-[#2A3070] overflow-hidden">
          <div className="p-6 border-b border-[#2A3070] flex justify-between items-center">
            <h2 className="font-extrabold text-lg">Security & Audit Log</h2>
            <span className="flex items-center gap-2 text-xs font-bold text-[#47745D] bg-[#47745D]/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#47745D] animate-pulse"></span>
              Live Monitoring
            </span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#14173F] text-[#C5C9F5] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Actor ID</th>
                <th className="p-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3070]">
              {logsRes.rows.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-[#C5C9F5]">No security events logged yet.</td></tr>
              )}
              {logsRes.rows.map((log: any) => (
                <tr key={log.id} className="hover:bg-[#2A3070]/30 transition-colors">
                  <td className="p-4 text-[#C5C9F5] tabular-nums">{new Date(Number(log.created_at)).toLocaleString()}</td>
                  <td className="p-4 font-bold text-[#A9AEFF]">{log.action}</td>
                  <td className="p-4 text-[#C5C9F5] font-mono text-xs">{log.actor_id ? log.actor_id.slice(0, 8) : 'SYSTEM'}</td>
                  <td className="p-4 text-[#C5C9F5]">{log.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}