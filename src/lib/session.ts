import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
};

export function passwordsMatch(input: string, expected: string, secret: string) {
  const left = createHmac("sha256", secret).update(input).digest();
  const right = createHmac("sha256", secret).update(expected).digest();
  return timingSafeEqual(left, right);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionValue(secret: string) {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
    } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionValue(token: string, secret: string) {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(payload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return false;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
