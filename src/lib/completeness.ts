import type { LedgerRecord } from "./ledger";

export interface DataCompleteness {
  total_records: number;
  documented_records: number;
  missing_evidence_count: number;
  coverage_percent: number;
}

export function calculateCompleteness(records: LedgerRecord[]): DataCompleteness {
  const active = records.filter(r => r.status !== "failed");
  const total = active.length;
  
  // "Documented" means it's not just "reported" — it has a receipt or a counter-signature.
  const documented = active.filter(r => 
    r.evidence_tier === "document_supported" || r.evidence_tier === "counter_signed"
  ).length;

  const missing = total - documented;
  const coverage = total === 0 ? 0 : Math.round((documented / total) * 100);

  return {
    total_records: total,
    documented_records: documented,
    missing_evidence_count: missing,
    coverage_percent: coverage,
  };
}