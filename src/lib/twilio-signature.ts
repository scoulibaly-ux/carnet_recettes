import { createHmac, timingSafeEqual } from "node:crypto";

export function twilioSignature(authToken: string, url: string, params: Record<string, string>) {
  const payload = Object.keys(params)
    .sort()
    .reduce((data, key) => data + key + params[key], url);
  return createHmac("sha1", authToken).update(payload, "utf8").digest("base64");
}

export function twilioSignatureValid(options: {
  authToken: string;
  signature: string | null;
  url: string;
  params: Record<string, string>;
}) {
  if (!options.signature) return false;
  const expected = twilioSignature(options.authToken, options.url, options.params);
  const actual = Buffer.from(options.signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length) return false;
  return timingSafeEqual(actual, wanted);
}

export function signedWebhookUrl(requestUrl: string, appBaseUrl: string) {
  const incoming = new URL(requestUrl);
  const base = appBaseUrl.replace(/\/$/, "");
  return `${base}${incoming.pathname}${incoming.search}`;
}
