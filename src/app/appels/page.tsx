import type { Metadata } from "next";
import { CallList } from "@/components/call-list";
import { AppelStatusBadge } from "@/components/status-badge";
import { DatabaseNotice } from "@/components/database-notice";
import { GuestHome } from "@/components/guest-home";
import { StorageNotice, TelephonyNotice } from "@/components/storage-notice";
import { TriggerCallsForm } from "@/components/trigger-calls-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";
import { DatabaseUnavailableError, type DatabaseProblem } from "@/lib/db";
import { APPEL_STATUSES } from "@/lib/labels";
import { readRepository, type RepositoryKind } from "@/lib/repository";
import type { Appel } from "@/lib/records";
import { currentTelephony } from "@/lib/telephony-mode";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal des appels",
};

export default async function CallsPage() {
  const connected = await isAdmin();
  if (!connected) return <GuestHome />;

  let appels: Appel[] = [];
  let kind: RepositoryKind = "neon";
  let problem: DatabaseProblem | null = null;

  try {
    const repository = await readRepository();
    kind = repository.kind;
    appels = await repository.listAppels();
  } catch (error) {
    problem = error instanceof DatabaseUnavailableError ? error.reason : "query";
  }

  const planned = appels
    .filter((appel) => appel.status === "planifie")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const history = appels.filter((appel) => appel.status !== "planifie");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Journal des appels
        </h1>
        <div className="flex flex-wrap gap-2">
          {APPEL_STATUSES.map((status) => (
            <AppelStatusBadge key={status} status={status} />
          ))}
        </div>
        <p className="text-base text-muted-foreground">
          Chaque ligne garde l&apos;heure de début et de fin.
        </p>
      </div>

      <TelephonyNotice decision={currentTelephony()} />
      {kind === "fichier" && !problem ? <StorageNotice kind={kind} /> : null}
      {problem ? <DatabaseNotice reason={problem} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Déclencheur</CardTitle>
          <CardDescription>
            Lance les appels dont l&apos;heure est atteinte. Le même traitement est exposé en{" "}
            <span className="font-medium">POST /api/appels/declencher</span> avec le secret cron.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TriggerCallsForm />
        </CardContent>
      </Card>

      {!problem ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Planifiés</h2>
          <CallList appels={planned} showDossier empty="Aucun appel en attente." />
        </section>
      ) : null}

      {!problem ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Historique</h2>
          <CallList appels={history} showDossier empty="Aucun appel lancé pour le moment." />
        </section>
      ) : null}
    </div>
  );
}
