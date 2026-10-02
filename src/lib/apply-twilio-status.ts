import "server-only";
import { mapTwilioCallStatus, twilioFailureDetail } from "@/lib/call-status";
import type { AppelPatch } from "@/lib/records";
import { getRepository } from "@/lib/repository";

export async function applyTwilioStatus(appelId: string, params: Record<string, string>) {
  const repository = await getRepository();
  const appel = await repository.getAppel(appelId);
  if (!appel || appel.status === "simulation" || appel.status === "termine") return;

  const next = mapTwilioCallStatus(params.CallStatus ?? "");
  const sid = params.CallSid?.startsWith("CA") ? params.CallSid : null;

  if (!next || appel.status === "echec") {
    if (sid && sid !== appel.twilioCallSid) {
      await repository.saveAppel(appel.id, { twilioCallSid: sid });
    }
    return;
  }

  const patch: AppelPatch = {
    status: next,
    mode: "reel",
    twilioCallSid: sid ?? appel.twilioCallSid,
    detail:
      next === "termine"
        ? "Appel terminé."
        : next === "echec"
          ? twilioFailureDetail(params.CallStatus ?? "")
          : appel.detail,
  };
  if (next !== "en_cours") patch.endedAt = new Date().toISOString();
  await repository.saveAppel(appel.id, patch);
}
