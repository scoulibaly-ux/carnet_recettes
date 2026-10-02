import "server-only";

type TwilioCall = {
  sid?: string;
  message?: string;
};

export async function createTwilioCall(options: {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
  voiceUrl: string;
  statusUrl: string;
}) {
  const body = new URLSearchParams({
    To: options.to,
    From: options.from,
    Url: options.voiceUrl,
    Method: "POST",
    StatusCallback: options.statusUrl,
    StatusCallbackMethod: "POST",
  });
  for (const event of ["initiated", "ringing", "answered", "completed"]) {
    body.append("StatusCallbackEvent", event);
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(options.accountSid)}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${options.accountSid}:${options.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: AbortSignal.timeout(20_000),
      },
    );
  } catch {
    throw new Error("Twilio n'a pas répondu. Aucun appel n'a été confirmé.");
  }

  const text = await response.text();
  let payload: TwilioCall = {};
  try {
    payload = JSON.parse(text) as TwilioCall;
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.sid?.startsWith("CA")) {
    const message = payload.message?.replace(/\s+/g, " ").trim();
    throw new Error(
      message ? `Twilio : ${message}`.slice(0, 300) : `Twilio a refusé l'appel (HTTP ${response.status}).`,
    );
  }

  return payload.sid;
}

export function hangupTwiml(message: string) {
  const safe = message.replace(/[&<>"']/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="fr-FR">${safe}</Say><Hangup/></Response>`;
}
