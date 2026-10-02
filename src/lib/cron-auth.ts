import { createHmac, timingSafeEqual } from "node:crypto";

export function bearerMatches(header: string | null, secret: string) {
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length);
  const left = createHmac("sha256", "recouvrement-cron").update(token).digest();
  const right = createHmac("sha256", "recouvrement-cron").update(secret).digest();
  return timingSafeEqual(left, right);
}
