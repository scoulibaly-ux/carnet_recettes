import Link from "next/link";
import { GuestHome } from "@/components/guest-home";
import { DossierStatusBadge } from "@/components/status-badge";
import { StorageNotice, TelephonyNotice } from "@/components/storage-notice";
import { DatabaseNotice } from "@/components/database-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";
import { DatabaseUnavailableError, type DatabaseProblem } from "@/lib/db";
import { formatDateTime, formatEuros } from "@/lib/format";
import { appelStatusLabel } from "@/lib/labels";
import { formatPhone } from "@/lib/phones";
import { readRepository, type RepositoryKind } from "@/lib/repository";
import type { Appel, Dossier } from "@/lib/records";
import { currentTelephony } from "@/lib/telephony-mode";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const connected = await isAdmin();
  if (!connected) return <GuestHome />;

  let dossiers: Dossier[] = [];
  let appels: Appel[] = [];
  let kind: RepositoryKind = "neon";
  let problem: DatabaseProblem | null = null;

  try {
    const repository = await readRepository();
    kind = repository.kind;
    [dossiers, appels] = await Promise.all([repository.listDossiers(), repository.listAppels()]);
  } catch (error) {
    problem = error instanceof DatabaseUnavailableError ? error.reason : "query";
  }

  const now = new Date().getTime();
  const openCount = dossiers.filter((dossier) => dossier.status !== "clos").length;
  const planned = appels.filter((appel) => appel.status === "planifie");
  const due = planned.filter((appel) => new Date(appel.scheduledAt).getTime() <= now).length;
  const nextByDossier = new Map<string, Appel>();
  for (const appel of [...planned].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))) {
    if (!nextByDossier.has(appel.dossierId)) nextByDossier.set(appel.dossierId, appel);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Dossiers</h1>
          <p className="text-base text-muted-foreground">
            Débiteurs, montants dus et prochaines relances téléphoniques.
          </p>
        </div>
        <Button asChild className="h-12 px-5 text-base">
          <Link href="/dossiers/nouveau">Nouveau dossier</Link>
        </Button>
      </div>

      <TelephonyNotice decision={currentTelephony()} />
      {kind === "fichier" && !problem ? <StorageNotice kind={kind} /> : null}
      {problem ? <DatabaseNotice reason={problem} /> : null}

      {!problem ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <li>
            <Card>
              <CardHeader>
                <CardDescription>Dossiers ouverts</CardDescription>
                <CardTitle className="text-2xl">{openCount}</CardTitle>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card>
              <CardHeader>
                <CardDescription>Appels planifiés</CardDescription>
                <CardTitle className="text-2xl">{planned.length}</CardTitle>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card>
              <CardHeader>
                <CardDescription>Dus maintenant</CardDescription>
                <CardTitle className="text-2xl">{due}</CardTitle>
              </CardHeader>
            </Card>
          </li>
        </ul>
      ) : null}

      {!problem && dossiers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun dossier pour le moment</CardTitle>
            <CardDescription>Créez le premier dossier, puis planifiez un appel.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {dossiers.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {dossiers.map((dossier) => {
            const next = nextByDossier.get(dossier.id);
            const latest = appels.find((appel) => appel.dossierId === dossier.id);
            return (
              <li key={dossier.id}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-lg">{dossier.debtorName}</CardTitle>
                      <DossierStatusBadge status={dossier.status} />
                    </div>
                    <CardDescription>
                      {dossier.reference ? dossier.reference : "Sans référence"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm">
                    <p>{formatEuros(dossier.amountCents)}</p>
                    <p className="text-muted-foreground">{formatPhone(dossier.phone)}</p>
                    <p className="text-muted-foreground">
                      {next
                        ? `Prochain appel · ${formatDateTime(next.scheduledAt)}`
                        : latest
                          ? `Dernier appel · ${appelStatusLabel[latest.status]}`
                          : "Aucun appel planifié"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="h-11 w-full text-base">
                      <Link href={`/dossiers/${dossier.id}`}>Ouvrir le dossier</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
