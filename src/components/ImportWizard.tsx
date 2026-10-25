"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

interface ImportWizardProps {
  businessId: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function ImportWizard({ businessId, onComplete, onClose }: ImportWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/stock?business_id=${businessId}`)
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [businessId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) return alert("CSV is empty");
        setFile(f);
        setHeaders(results.meta.fields || []);
        setData(results.data);

        // Auto-map if headers match common patterns
        const initialMap: Record<string, string> = {};
        results.meta.fields?.forEach((h) => {
          const lower = h.toLowerCase();
          if (lower.includes("desc") || lower.includes("item") || lower.includes("detail")) initialMap[h] = "description";
          if (lower.includes("amount") || lower.includes("price") || lower.includes("total")) initialMap[h] = "amount";
          if (lower.includes("date") || lower.includes("time")) initialMap[h] = "date";
          if (lower.includes("qty") || lower.includes("quantity")) initialMap[h] = "quantity";
          if (lower.includes("type") || lower.includes("category")) initialMap[h] = "kind";
          if (lower.includes("product") || lower.includes("sku")) initialMap[h] = "product_id";
        });
        setMapping(initialMap);
        setStep(2);
      },
      error: (err) => alert("Error parsing CSV: " + err.message),
    });
  };

  // Resolve the CSV column header mapped to a given target field
  const headerFor = (target: string): string | undefined =>
    headers.find((h) => mapping[h] === target);

  const matchProduct = (csvValue: any) => {
    if (!csvValue) return null;
    const key = String(csvValue).toLowerCase().trim();
    return products.find((p) => p.name.toLowerCase().trim() === key) ?? null;
  };

  const handleCommit = async () => {
    setBusy(true);
    try {
      const getMapped = (row: any, target: string): string => {
        const header = headerFor(target);
        return header ? String(row[header] ?? "") : "";
      };

      const recordsToSubmit = data
        .map((row) => {
          const amountStr = getMapped(row, "amount").replace(/[^0-9.-]+/g, "");
          const amount = parseFloat(amountStr) || 0;

          let occurredAt = Date.now();
          const dateStr = getMapped(row, "date");
          if (dateStr) {
            const parsedDate = new Date(dateStr).getTime();
            if (!isNaN(parsedDate)) occurredAt = parsedDate;
          }

          let productId: string | null = null;
          const csvProductName = getMapped(row, "product_id").toLowerCase().trim();
          if (csvProductName) {
            const matched = products.find((p) => p.name.toLowerCase().trim() === csvProductName);
            if (matched) productId = matched.id;
          }

          const qtyStr = getMapped(row, "quantity");

          return {
            kind: getMapped(row, "kind") || "sale",
            amount: Math.abs(amount),
            quantity: qtyStr ? parseInt(qtyStr, 10) : null,
            description: getMapped(row, "description") || "Imported record",
            occurred_at: occurredAt,
            product_id: productId,
          };
        })
        .filter((r) => r.amount > 0);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business_id: businessId, records: recordsToSubmit }),
      });

      if (!res.ok) throw new Error("Failed to import");

      const json = await res.json();
      alert(`Successfully sealed ${json.count} records into the ledger.`);
      onComplete();
      onClose();
    } catch (e) {
      alert("Import failed. Check the console.");
    } finally {
      setBusy(false);
    }
  };

  // Pre-compute how many rows have matched vs unmatched products
  const productHeader = headerFor("product_id");
  let matchedCount = 0;
  let unmatchedCount = 0;
  if (productHeader) {
    for (const row of data) {
      const csvValue = row[productHeader];
      if (!csvValue) continue;
      if (matchProduct(csvValue)) matchedCount++;
      else unmatchedCount++;
    }
  }

  return (
    <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14173F]">Import Data</h2>
            <p className="text-sm text-[#4A4F7A]">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-[#5A5F8C] hover:text-[#14173F] font-bold">
            ✕
          </button>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="border-2 border-dashed border-[#E1E4F7] rounded-2xl p-12 text-center hover:border-[#5B5BE0] transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 bg-[#F1F2FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B4FC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p className="font-bold text-[#14173F] mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-[#5A5F8C]">Only .CSV files are supported in this demo</p>
          </div>
        )}

        {/* Step 2: Map Columns */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#4A4F7A] mb-4">Match your CSV columns to SCRIBE fields.</p>
            {headers.map((h) => (
              <div key={h} className="flex items-center justify-between gap-4 bg-[#F1F2FF] p-3 rounded-xl">
                <span className="font-bold text-sm text-[#14173F] w-1/3 truncate">{h}</span>
                <select
                  value={mapping[h] || ""}
                  onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })}
                  className="flex-1 bg-white border border-[#E1E4F7] rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Ignore column</option>
                  <option value="description">Description (Required)</option>
                  <option value="amount">Amount (Required)</option>
                  <option value="date">Date</option>
                  <option value="quantity">Quantity</option>
                  <option value="kind">Type (e.g. sale/expense)</option>
                  <option value="product_id">Product (Match to Inventory)</option>
                </select>
              </div>
            ))}

            {(!headerFor("description") || !headerFor("amount")) && (
              <p className="text-xs text-[#A94E40] font-bold">
                You must map at least a Description and Amount column.
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!headerFor("description") || !headerFor("amount")}
                className="flex-1 px-6 py-3 bg-[#14173F] text-white font-bold rounded-xl disabled:opacity-50"
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-[#FFF0C4] border border-[#D99A00] rounded-xl p-4 text-xs text-[#1D2260] leading-relaxed">
              <strong>Review before sealing:</strong> These records will be cryptographically signed into your ledger. Check the first 5 rows for accuracy.
            </div>

            {productHeader && (unmatchedCount > 0 || matchedCount > 0) && (
              <div
                className={`rounded-xl p-3 text-xs leading-relaxed border ${
                  unmatchedCount > 0
                    ? "bg-[#FFF0C4] border-[#D99A00] text-[#1D2260]"
                    : "bg-[#47745D]/10 border-[#47745D]/30 text-[#47745D]"
                }`}
              >
                {matchedCount} product{matchedCount === 1 ? "" : "s"} matched to inventory
                {unmatchedCount > 0
                  ? `, ${unmatchedCount} unmatched (those rows will still be recorded as revenue but stock won't be deducted).`
                  : "."}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-[#E1E4F7]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F2FF] text-[#4A4F7A] font-bold">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E4F7]">
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td className="p-3 text-[#14173F]">
                        {headerFor("description") ? row[headerFor("description")!] : ""}
                      </td>
                      <td className="p-3 font-bold text-[#5B5BE0]">
                        R{headerFor("amount") ? row[headerFor("amount")!] : ""}
                      </td>
                      <td className="p-3 text-[#4A4F7A]">
                        {headerFor("date") ? row[headerFor("date")!] || "Today" : "Today"}
                      </td>
                      <td className="p-3">
                        {(() => {
                          if (!productHeader) return <span className="text-[#5A5F8C]">—</span>;
                          const csvValue = row[productHeader];
                          if (!csvValue) return <span className="text-[#5A5F8C]">—</span>;
                          const match = matchProduct(csvValue);
                          return match ? (
                            <span className="text-[#47745D] font-bold">✓ {match.name}</span>
                          ) : (
                            <span className="text-[#D99A00] font-bold">⚠ {String(csvValue)}</span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#5A5F8C]">Showing 5 of {data.length} rows.</p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleCommit}
                disabled={busy}
                className="flex-1 px-6 py-3 bg-[#14173F] text-white font-bold rounded-xl hover:bg-[#2A3070] disabled:opacity-50"
              >
                {busy ? "Sealing records..." : `Seal ${data.length} Records`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}