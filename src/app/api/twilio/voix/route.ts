import { connectCallVoice } from "@/lib/run-calls";
import { getRepository } from "@/lib/repository";
import { isRecordId } from "@/lib/records";
import { currentTelephony } from "@/lib/telephony-mode";
import { hangupTwiml } from "@/lib/twilio";
import { signedWebhookUrl, twilioSignatureValid } from "@/lib/twilio-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xml(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

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
    return xml(hangupTwiml("Le service d'appel n'est pas configuré."), 403);
  }

  const params = await formParams(request);
  const valid = twilioSignatureValid({
    authToken: decision.authToken,
    signature: request.headers.get("x-twilio-signature"),
    url: signedWebhookUrl(request.url, decision.appBaseUrl),
    params,
  });
  if (!valid) return xml(hangupTwiml("Requête refusée."), 403);

  const appelId = new URL(request.url).searchParams.get("appel") ?? "";
  if (!isRecordId(appelId)) return xml(hangupTwiml("Appel introuvable."));

  try {
    const twiml = await connectCallVoice(appelId);
    if (!twiml) return xml(hangupTwiml("Cet appel ne peut pas être connecté."));
    return xml(twiml);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "La voix n'a pas pu être connectée.";
    try {
      const repository = await getRepository();
      await repository.saveAppel(appelId, {
        status: "echec",
        endedAt: new Date().toISOString(),
        detail,
      });
    } catch {
      // Twilio doit quand même recevoir un TwiML pour raccrocher.
    }
    return xml(hangupTwiml("Le service de relance est momentanément indisponible. Au revoir."));
  }
}
