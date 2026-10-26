"use client";

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ImportWizardProps {
  businessId: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function ImportWizard({ businessId, onComplete, onClose }: ImportWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setError(null);
    setParsing(true);
    setFileName(f.name);

    const ext = f.name.split(".").pop()?.toLowerCase();

    try {
      if (ext === "csv") {
        Papa.parse(f, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length === 0) {
              setError("This CSV is empty.");
              setParsing(false);
              return;
            }
            setupFromRows(results.meta.fields || [], results.data as any[]);
          },
          error: (err) => {
            setError("Could not parse CSV: " + err.message);
            setParsing(false);
          },
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const buffer = await f.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(firstSheet, { header: 1 });

        if (rows.length === 0) {
          setError("This spreadsheet is empty.");
          setParsing(false);
          return;
        }

        const headerRow = rows[0] as string[];
        const dataRows = rows.slice(1).map((row: any[]) => {
          const obj: Record<string, any> = {};
          headerRow.forEach((h, i) => { obj[String(h)] = row[i]; });
          return obj;
        });
        setupFromRows(headerRow, dataRows);
      } else if (ext === "pdf") {
        const buffer = await f.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

        const res = await fetch("/api/import/pdf", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pdf_base64: base64 }),
        });

        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "PDF extraction failed. Try CSV or XLSX.");
          setParsing(false);
          return;
        }

        const transactions = json.transactions || [];
        if (transactions.length === 0) {
          setError(json.notes || "No transactions found in this PDF.");
          setParsing(false);
          return;
        }

        // PDFs come pre-parsed with known fields, so skip mapping
        setHeaders(["date", "description", "amount", "type", "quantity"]);
        setData(transactions);
        setMapping({
          date: "date",
          description: "description",
          amount: "amount",
          type: "type",
          quantity: "quantity",
        });
        setStep(3); // Jump straight to review
        setParsing(false);
        return;
      } else {
        setError("Unsupported file type. Please upload CSV, XLSX, or PDF.");
        setParsing(false);
        return;
      }
    } catch (e: any) {
      setError("Could not read file: " + e.message);
      setParsing(false);
    }
  };

  const setupFromRows = (headerRow: string[], dataRows: any[]) => {
    setHeaders(headerRow);
    setData(dataRows);

    const initialMap: Record<string, string> = {};
    headerRow.forEach((h) => {
      const lower = h.toLowerCase();
      if (lower.includes("desc") || lower.includes("item") || lower.includes("detail")) initialMap[h] = "description";
      if (lower.includes("amount") || lower.includes("price") || lower.includes("total")) initialMap[h] = "amount";
      if (lower.includes("date") || lower.includes("time")) initialMap[h] = "date";
      if (lower.includes("qty") || lower.includes("quantity")) initialMap[h] = "quantity";
      if (lower.includes("type") || lower.includes("category")) initialMap[h] = "kind";
    });
    setMapping(initialMap);
    setStep(2);
    setParsing(false);
  };

  const handleCommit = async () => {
    setBusy(true);
    setError(null);
    try {
      const recordsToSubmit = data.map((row) => {
        const amountStr = String(row[mapping["amount"]] || "0").replace(/[^0-9.-]+/g, "");
        const amount = parseFloat(amountStr) || 0;

        let occurredAt = Date.now();
        if (mapping["date"] && row[mapping["date"]]) {
          const parsedDate = new Date(row[mapping["date"]]).getTime();
          if (!isNaN(parsedDate)) occurredAt = parsedDate;
        }

        let kind = "sale";
        if (mapping["kind"] && row[mapping["kind"]]) {
          const kindValue = String(row[mapping["kind"]]).toLowerCase();
          if (kindValue.includes("expense") || kindValue.includes("purchase") || kindValue.includes("payment")) {
            kind = "expense";
          }
        }

        return {
          kind,
          amount: Math.abs(amount),
          quantity: mapping["quantity"] ? parseInt(row[mapping["quantity"]] || "0") : null,
          description: row[mapping["description"]] || "Imported record",
          occurred_at: occurredAt,
        };
      }).filter((r) => r.amount > 0);

      if (recordsToSubmit.length === 0) {
        setError("No valid rows found. Check your column mapping.");
        setBusy(false);
        return;
      }

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business_id: businessId, records: recordsToSubmit }),
      });

      if (!res.ok) throw new Error("Failed to import");
      const json = await res.json();

      onComplete();
      onClose();
      alert(`✓ Successfully sealed ${json.count} records into the ledger.`);
    } catch (e: any) {
      setError(e.message || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const descriptionColumn = headers.find((h) => mapping[h] === "description");
  const amountColumn = headers.find((h) => mapping[h] === "amount");
  const canContinue = descriptionColumn && amountColumn;

  return (
    <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white">Import Data</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
              {fileName ? `File: ${fileName}` : `Step ${step} of 3`}
            </p>
          </div>
          <button onClick={onClose} className="text-[#5A5F8C] hover:text-[#14173F] dark:hover:text-white text-xl font-bold">✕</button>
        </div>

        {error && (
          <div className="bg-[#B3261E]/10 border border-[#B3261E] text-[#B3261E] dark:text-[#FF8A80] rounded-xl p-4 mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* ─── STEP 1: Upload ─── */}
        {step === 1 && (
          <div className="border-2 border-dashed border-[#E1E4F7] dark:border-[#3A4080] rounded-2xl p-12 text-center hover:border-[#5B5BE0] transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={parsing}
            />
            <div className="w-14 h-14 bg-[#F1F2FF] dark:bg-[#2A3070] rounded-full flex items-center justify-center mx-auto mb-4">
              {parsing ? (
                <div className="w-6 h-6 border-2 border-[#5B5BE0] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B4FC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              )}
            </div>
            <p className="font-bold text-[#14173F] dark:text-white mb-1">
              {parsing ? "Reading file…" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">CSV, XLSX, XLS, or PDF · Up to 10 MB</p>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mt-2">
              PDFs are read by AI and shown for review before anything is saved.
            </p>
          </div>
        )}

        {/* ─── STEP 2: Map Columns ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-4">
              Match your columns to SCRIBE fields. Only Description and Amount are required.
            </p>
            {headers.map((h) => (
              <div key={h} className="flex items-center justify-between gap-4 bg-[#F1F2FF] dark:bg-[#2A3070] p-3 rounded-xl">
                <span className="font-bold text-sm text-[#14173F] dark:text-white w-1/3 truncate">{h}</span>
                <select
                  value={mapping[h] || ""}
                  onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })}
                  className="flex-1 bg-white dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#3A4080] rounded-lg px-3 py-2 text-sm text-[#14173F] dark:text-white outline-none"
                >
                  <option value="">Ignore</option>
                  <option value="description">Description *</option>
                  <option value="amount">Amount *</option>
                  <option value="date">Date</option>
                  <option value="quantity">Quantity</option>
                  <option value="kind">Type (sale/expense)</option>
                </select>
              </div>
            ))}

            {!canContinue && (
              <p className="text-xs text-[#B3261E] dark:text-[#FF8A80] font-bold">
                You must map at least a Description and Amount column.
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={() => { setStep(1); setFileName(""); }} className="px-6 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canContinue}
                className="flex-1 px-6 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl disabled:opacity-50 hover:bg-[#4B4FC9] transition-colors"
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Review & Confirm ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] border border-[#D99A00] rounded-xl p-4 text-xs text-[#1D2260] dark:text-[#F1F2FF] leading-relaxed">
              <strong>Review before sealing:</strong> {data.length} records will be cryptographically signed into your ledger. Check the preview for accuracy.
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E1E4F7] dark:border-[#2A3070]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4A4F7A] dark:text-[#C5C9F5] font-bold">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E4F7] dark:divide-[#2A3070]">
                  {data.slice(0, 8).map((row, i) => (
                    <tr key={i}>
                      <td className="p-3 text-[#14173F] dark:text-white">
                        {row[mapping[descriptionColumn!] || descriptionColumn!] || "—"}
                      </td>
                      <td className="p-3 font-bold text-[#5B5BE0] tabular-nums">
                        R{String(row[amountColumn!] || "").replace(/[^0-9.-]+/g, "") || "0"}
                      </td>
                      <td className="p-3 text-[#4A4F7A] dark:text-[#C5C9F5]">
                        {row[headers.find((h) => mapping[h] === "date") || ""] || "Today"}
                      </td>
                      <td className="p-3 text-[#4A4F7A] dark:text-[#C5C9F5]">
                        {row[headers.find((h) => mapping[h] === "kind") || ""] || "sale"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
              Showing {Math.min(8, data.length)} of {data.length} rows.
            </p>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="px-6 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
                Back
              </button>
              <button
                onClick={handleCommit}
                disabled={busy}
                className="flex-1 px-6 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50"
              >
                {busy ? "Sealing records…" : `Seal ${data.length} Records`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}