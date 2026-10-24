export const rands = (cents: number) =>
  `R${(cents / 100).toLocaleString("en-ZA")}`;

export const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });