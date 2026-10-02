"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { DatabaseUnavailableError, databaseMessage } from "@/lib/db";
import { runDueCalls, summarizeRuns } from "@/lib/run-calls";

export type TriggerState = { error?: string; notice?: string } | null;

export async function triggerDueCallsAction(): Promise<TriggerState> {
  if (!(await isAdmin())) {
    return { error: "Vous devez être connecté pour lancer les appels." };
  }

  try {
    const runs = await runDueCalls();
    revalidatePath("/", "layout");
    return { notice: summarizeRuns(runs) };
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return { error: databaseMessage(error.reason) };
    }
    return { error: "Impossible de lancer les appels pour le moment." };
  }
}
