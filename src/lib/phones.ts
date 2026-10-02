const E164 = /^\+[1-9]\d{7,14}$/;

export function normalizePhone(raw: string): string | null {
  let value = raw.trim().replace(/[\s.\-()]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (/^0\d{9}$/.test(value)) value = `+33${value.slice(1)}`;
  if (!E164.test(value)) return null;
  return value;
}

export function formatPhone(e164: string) {
  if (/^\+33\d{9}$/.test(e164)) {
    const national = e164.slice(3);
    return `+33 ${national[0]} ${national.slice(1, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7)}`;
  }
  return e164;
}
