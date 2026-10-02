import { bearerMatches } from "@/lib/cron-auth";
import { DatabaseUnavailableError, databaseMessage } from "@/lib/db";
import { runDueCalls } from "@/lib/run-calls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function trigger(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET n'est pas configuré." },
      { status: 503 },
    );
  }
  if (!bearerMatches(request.headers.get("authorization"), secret)) {
    return Response.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  try {
    const runs = await runDueCalls();
    return Response.json({ ok: true, traites: runs.length, appels: runs });
  } catch (error) {
    const message =
      error instanceof DatabaseUnavailableError
        ? databaseMessage(error.reason)
        : "Impossible de lancer les appels.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export function GET(request: Request) {
  return trigger(request);
}

export function POST(request: Request) {
  return trigger(request);
}
