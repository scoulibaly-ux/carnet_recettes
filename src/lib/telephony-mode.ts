export type TelephonyEnv = {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_AGENT_ID?: string;
  APP_BASE_URL?: string;
};

export type TelephonyDecision =
  | {
      mode: "reel";
      accountSid: string;
      authToken: string;
      fromNumber: string;
      elevenLabsApiKey: string;
      agentId: string;
      appBaseUrl: string;
    }
  | { mode: "local" }
  | { mode: "non_configure"; detail: string };

const LOCAL_DETAIL =
  "Simulation locale : aucun appel réel. Renseignez Twilio et ElevenLabs pour composer le numéro.";

function trimmed(value: string | undefined) {
  return value?.trim() ?? "";
}

function httpsOrigin(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return value.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function decideTelephony(env: TelephonyEnv, nodeEnv: string): TelephonyDecision {
  const accountSid = trimmed(env.TWILIO_ACCOUNT_SID);
  const authToken = trimmed(env.TWILIO_AUTH_TOKEN);
  const fromNumber = trimmed(env.TWILIO_FROM_NUMBER);
  const elevenLabsApiKey = trimmed(env.ELEVENLABS_API_KEY);
  const agentId = trimmed(env.ELEVENLABS_AGENT_ID);
  const appBaseUrl = trimmed(env.APP_BASE_URL);
  const values = [accountSid, authToken, fromNumber, elevenLabsApiKey, agentId, appBaseUrl];
  const anySet = values.some(Boolean);

  if (!anySet) {
    if (nodeEnv === "production") {
      return {
        mode: "non_configure",
        detail: "Twilio et ElevenLabs ne sont pas configurés. Aucun appel n'a été passé.",
      };
    }
    return { mode: "local" };
  }

  const missing: string[] = [];
  if (!accountSid) missing.push("TWILIO_ACCOUNT_SID");
  if (!authToken) missing.push("TWILIO_AUTH_TOKEN");
  if (!fromNumber) missing.push("TWILIO_FROM_NUMBER");
  if (!elevenLabsApiKey) missing.push("ELEVENLABS_API_KEY");
  if (!agentId) missing.push("ELEVENLABS_AGENT_ID");
  if (!appBaseUrl) missing.push("APP_BASE_URL");

  if (missing.length > 0) {
    return {
      mode: "non_configure",
      detail: `Configuration incomplète (${missing.join(", ")}). Aucun appel n'a été passé.`,
    };
  }

  if (!/^\+[1-9]\d{7,14}$/.test(fromNumber)) {
    return {
      mode: "non_configure",
      detail:
        "TWILIO_FROM_NUMBER doit être au format international, par exemple +33123456789. Aucun appel n'a été passé.",
    };
  }

  const base = httpsOrigin(appBaseUrl);
  if (!base) {
    return {
      mode: "non_configure",
      detail: "APP_BASE_URL doit être l'URL https publique de l'application. Aucun appel n'a été passé.",
    };
  }

  return {
    mode: "reel",
    accountSid,
    authToken,
    fromNumber,
    elevenLabsApiKey,
    agentId,
    appBaseUrl: base,
  };
}

export function currentTelephony() {
  return decideTelephony(
    {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID,
      APP_BASE_URL: process.env.APP_BASE_URL,
    },
    process.env.NODE_ENV ?? "production",
  );
}

export function localSimulationDetail() {
  return LOCAL_DETAIL;
}
