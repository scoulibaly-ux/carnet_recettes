const MAX_CENTS = 1_000_000_000;

export function parseEurosToCents(raw: string): number | null {
  const cleaned = raw.replace(/[\s\u00a0]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [euros, fraction = ""] = cleaned.split(".");
  const cents = Number(euros) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_CENTS) return null;
  return cents;
}
