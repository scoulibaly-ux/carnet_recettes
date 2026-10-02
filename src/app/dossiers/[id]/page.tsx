import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallList } from "@/components/call-list";
import { DatabaseNotice } from "@/components/database-notice";
import { DossierStatusForm } from "@/components/dossier-status-form";
import { GuestHome } from "@/components/guest-home";
import { ScheduleCallForm } from "@/components/schedule-call-form";
import { DossierStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";
import { DatabaseUnavailableError, type DatabaseProblem } from "@/lib/db";
import { formatDateTime, formatEuros } from "@/lib/format";
import { toParisDateTimeLocal } from "@/lib/paris-time";
import { formatPhone } from "@/lib/phones";
import { readRepository } from "@/lib/repository";
import { isRecordId, type Appel, type Dossier } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isRecordId(id)) return { title: "Dossier introuvable" };
  if (!(await isAdmin())) return { title: "Dossier" };

  try {
    const repository = await readRepository();
    const dossier = await repository.getDossier(id);
    if (!dossier) return { title: "Dossier introuvable" };
    return { title: dossier.debtorName, description: `Dossier de ${formatEuros(dossier.amountCents)}` };
  } catch {
    return { title: "Dossier" };
  }
}

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const connected = await isAdmin();
  if (!connected) return <GuestHome />;
  if (!isRecordId(id)) notFound();

  let dossier: Dossier | null = null;
  let appels: Appel[] = [];
  let problem: DatabaseProblem | null = null;

  try {
    const repository = await readRepository();
    const [found, all] = await Promise.all([repository.getDossier(id), repository.listAppels()]);
    dossier = found;
    if (dossier) appels = all.filter((appel) => appel.dossierId === id);
  } catch (error) {
    problem = error instanceof DatabaseUnavailableError ? error.reason : "query";
  }

  if (problem) return <DatabaseNotice reason={problem} />;
  if (!dossier) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" className="h-11 w-fit px-2 text-base">
          <Link href="/">Retour aux dossiers</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{dossier.debtorName}</h1>
          <DossierStatusBadge status={dossier.status} />
        </div>
        <p className="text-base text-muted-foreground">
          {dossier.reference ? `Référence ${dossier.reference}` : "Sans référence"} · créé le{" "}
          {formatDateTime(dossier.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dossier</CardTitle>
            <CardDescription>{formatEuros(dossier.amountCents)} dus</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>{formatPhone(dossier.phone)}</p>
            {dossier.notes ? <p className="whitespace-pre-wrap text-muted-foreground">{dossier.notes}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
            <CardDescription>Ouvert, en relance, ou clos.</CardDescription>
          </CardHeader>
          <CardContent>
            <DossierStatusForm dossierId={dossier.id} status={dossier.status} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planifier un appel</CardTitle>
          <CardDescription>
            Twilio passera l&apos;appel à l&apos;heure choisie. ElevenLabs tiendra la conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleCallForm
            dossierId={dossier.id}
            defaultPhone={formatPhone(dossier.phone)}
            defaultWhen={toParisDateTimeLocal(new Date())}
          />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Appels de ce dossier</h2>
          <Button asChild variant="outline" className="h-11 px-4 text-base">
            <Link href="/appels">Journal des appels</Link>
          </Button>
        </div>
        <CallList appels={appels} showDossier={false} empty="Aucun appel sur ce dossier." />
      </section>
    </div>
  );
}
