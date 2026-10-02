import { applyTwilioStatus } from "@/lib/apply-twilio-status";
import { isRecordId } from "@/lib/records";
import { currentTelephony } from "@/lib/telephony-mode";
import { signedWebhookUrl, twilioSignatureValid } from "@/lib/twilio-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function formParams(request: Request) {
  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") params[key] = value;
  }
  return params;
}

export async function POST(request: Request) {
  const decision = currentTelephony();
  if (decision.mode !== "reel") {
    return new Response("Téléphonie non configurée.", { status: 403 });
  }

  const params = await formParams(request);
  const valid = twilioSignatureValid({
    authToken: decision.authToken,
    signature: request.headers.get("x-twilio-signature"),
    url: signedWebhookUrl(request.url, decision.appBaseUrl),
    params,
  });
  if (!valid) return new Response("Signature invalide.", { status: 403 });

  const appelId = new URL(request.url).searchParams.get("appel") ?? "";
  if (!isRecordId(appelId)) return new Response("Appel introuvable.", { status: 404 });

  await applyTwilioStatus(appelId, params);
  return new Response("ok");
}
