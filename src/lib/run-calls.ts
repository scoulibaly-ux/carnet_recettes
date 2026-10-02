import "server-only";
import { DatabaseUnavailableError } from "@/lib/db";
import { registerElevenLabsCall } from "@/lib/elevenlabs";
import { appelStatusLabel, type AppelStatus } from "@/lib/labels";
import { getRepository } from "@/lib/repository";
import { currentTelephony, localSimulationDetail } from "@/lib/telephony-mode";
import { createTwilioCall } from "@/lib/twilio";

const BATCH = 5;

export type CallRun = {
  id: string;
  status: AppelStatus;
  detail: string | null;
};

function voiceUrl(base: string, appelId: string) {
  const url = new URL("/api/twilio/voix", base);
  url.searchParams.set("appel", appelId);
  return url.toString();
}

function statusUrl(base: string, appelId: string) {
  const url = new URL("/api/twilio/statut", base);
  url.searchParams.set("appel", appelId);
  return url.toString();
}

export function summarizeRuns(runs: CallRun[]) {
  if (runs.length === 0) return "Aucun appel dû pour le moment.";
  const counts = new Map<AppelStatus, number>();
  for (const run of runs) counts.set(run.status, (counts.get(run.status) ?? 0) + 1);
  const parts = [...counts.entries()].map(([status, count]) => {
    const label = appelStatusLabel[status].toLocaleLowerCase("fr-FR");
    return `${count} ${label}`;
  });
  const noun = runs.length > 1 ? "appels traités" : "appel traité";
  return `${runs.length} ${noun} : ${parts.join(", ")}.`;
}

export async function runDueCalls(now = new Date()): Promise<CallRun[]> {
  const repository = await getRepository();
  const ids = await repository.listDueAppelIds(now, BATCH);
  const runs: CallRun[] = [];

  for (const id of ids) {
    const claimed = await repository.claimDueAppel(id, now);
    if (!claimed) continue;

    const appel = await repository.getAppel(id);
    const dossier = appel ? await repository.getDossier(appel.dossierId) : null;
    if (!appel || !dossier) {
      const detail = "Dossier introuvable. Aucun appel n'a été passé.";
      await repository.saveAppel(id, {
        status: "echec",
        endedAt: now.toISOString(),
        detail,
      });
      runs.push({ id, status: "echec", detail });
      continue;
    }

    const decision = currentTelephony();
    if (decision.mode === "local") {
      const detail = localSimulationDetail();
      await repository.saveAppel(id, {
        status: "simulation",
        mode: "local",
        endedAt: now.toISOString(),
        detail,
      });
      runs.push({ id, status: "simulation", detail });
      continue;
    }

    if (decision.mode === "non_configure") {
      await repository.saveAppel(id, {
        status: "echec",
        endedAt: now.toISOString(),
        detail: decision.detail,
      });
      runs.push({ id, status: "echec", detail: decision.detail });
      continue;
    }

    try {
      const sid = await createTwilioCall({
        accountSid: decision.accountSid,
        authToken: decision.authToken,
        from: decision.fromNumber,
        to: appel.phone,
        voiceUrl: voiceUrl(decision.appBaseUrl, appel.id),
        statusUrl: statusUrl(decision.appBaseUrl, appel.id),
      });
      const detail = "Appel confié à Twilio. ElevenLabs prendra la voix à la connexion.";
      await repository.saveAppel(id, {
        status: "en_cours",
        mode: "reel",
        twilioCallSid: sid,
        detail,
      });
      runs.push({ id, status: "en_cours", detail });
    } catch (error) {
      if (error instanceof DatabaseUnavailableError) throw error;
      const detail = error instanceof Error ? error.message : "Impossible de passer l'appel.";
      await repository.saveAppel(id, {
        status: "echec",
        mode: "reel",
        endedAt: now.toISOString(),
        detail,
      });
      runs.push({ id, status: "echec", detail });
    }
  }

  return runs;
}

export async function connectCallVoice(appelId: string) {
  const repository = await getRepository();
  const appel = await repository.getAppel(appelId);
  const dossier = appel ? await repository.getDossier(appel.dossierId) : null;
  const decision = currentTelephony();
  if (!appel || !dossier || decision.mode !== "reel") return null;
  if (appel.status !== "en_cours") return null;

  const registered = await registerElevenLabsCall({
    apiKey: decision.elevenLabsApiKey,
    agentId: decision.agentId,
    fromNumber: decision.fromNumber,
    toNumber: appel.phone,
    dossier,
  });

  await repository.saveAppel(appel.id, {
    elevenLabsConversationId: registered.conversationId,
    detail: "Conversation ElevenLabs connectée à l'appel Twilio.",
  });

  return registered.twiml;
}
