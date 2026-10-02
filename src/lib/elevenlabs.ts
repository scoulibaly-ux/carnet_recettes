import "server-only";
import { formatEuros } from "@/lib/format";
import type { Dossier } from "@/lib/records";

function asTwiml(body: string) {
  const trimmed = body.trim();
  let xml = trimmed;
  if (trimmed.startsWith("{") || trimmed.startsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (typeof parsed === "string") xml = parsed.trim();
      else if (
        parsed &&
        typeof parsed === "object" &&
        "twiml" in parsed &&
        typeof (parsed as { twiml: unknown }).twiml === "string"
      ) {
        xml = (parsed as { twiml: string }).twiml.trim();
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  if (!xml.includes("<Response")) return null;
  return xml;
}

function conversationVariables(dossier: Dossier) {
  return {
    nom_debiteur: dossier.debtorName,
    montant: formatEuros(dossier.amountCents),
    reference: dossier.reference || "non précisée",
    telephone: dossier.phone,
  };
}

function firstMessage(dossier: Dossier) {
  const reference = dossier.reference ? ` (référence ${dossier.reference})` : "";
  return `Bonjour, je vous contacte au sujet d'un dossier de recouvrement de ${formatEuros(dossier.amountCents)}${reference}. Suis-je bien en ligne avec ${dossier.debtorName} ?`;
}

async function postRegisterCall(apiKey: string, body: unknown) {
  const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/register-call", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, twiml: asTwiml(text) };
}

export async function registerElevenLabsCall(options: {
  apiKey: string;
  agentId: string;
  fromNumber: string;
  toNumber: string;
  dossier: Dossier;
}) {
  const variables = conversationVariables(options.dossier);
  const shared = {
    agent_id: options.agentId,
    from_number: options.fromNumber,
    to_number: options.toNumber,
    direction: "outbound",
  };

  let result: { ok: boolean; status: number; twiml: string | null };
  try {
    result = await postRegisterCall(options.apiKey, {
      ...shared,
      conversation_initiation_client_data: {
        dynamic_variables: variables,
        conversation_config_override: {
          agent: {
            language: "fr",
            first_message: firstMessage(options.dossier),
          },
        },
      },
    });
  } catch {
    throw new Error("ElevenLabs n'a pas répondu. La voix n'a pas été connectée.");
  }

  if (!result.ok || !result.twiml) {
    try {
      result = await postRegisterCall(options.apiKey, {
        ...shared,
        conversation_initiation_client_data: {
          dynamic_variables: variables,
        },
      });
    } catch {
      throw new Error("ElevenLabs n'a pas répondu. La voix n'a pas été connectée.");
    }
  }

  if (!result.ok || !result.twiml) {
    throw new Error(`ElevenLabs a refusé la voix de l'appel (HTTP ${result.status}).`);
  }

  const conversation = result.twiml.match(/name="conversation_id"\s+value="([^"]+)"/i);
  return {
    twiml: result.twiml,
    conversationId: conversation?.[1] ?? null,
  };
}
