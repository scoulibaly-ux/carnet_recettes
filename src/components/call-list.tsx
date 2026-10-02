import Link from "next/link";
import { AppelStatusBadge, appelCardTone } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phones";
import type { Appel } from "@/lib/records";

export function CallList({
  appels,
  showDossier,
  empty,
}: {
  appels: Appel[];
  showDossier: boolean;
  empty: string;
}) {
  if (appels.length === 0) {
    return <p className="text-base text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {appels.map((appel) => (
        <li key={appel.id}>
          <Card className={appelCardTone[appel.status]}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>
                  {showDossier ? (
                    <Link href={`/dossiers/${appel.dossierId}`} className="hover:underline">
                      {appel.debtorName}
                    </Link>
                  ) : (
                    formatPhone(appel.phone)
                  )}
                </CardTitle>
                <AppelStatusBadge status={appel.status} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {showDossier ? (
                <p>
                  <span className="text-muted-foreground">Téléphone · </span>
                  {formatPhone(appel.phone)}
                </p>
              ) : null}
              {appel.reference ? (
                <p>
                  <span className="text-muted-foreground">Référence · </span>
                  {appel.reference}
                </p>
              ) : null}
              <p>
                <span className="text-muted-foreground">Planifié · </span>
                {formatDateTime(appel.scheduledAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Début · </span>
                {formatDateTime(appel.startedAt)}
                <span className="text-muted-foreground"> · Fin · </span>
                {formatDateTime(appel.endedAt)}
              </p>
              {appel.mode ? (
                <p>
                  <span className="text-muted-foreground">Mode · </span>
                  {appel.mode === "local" ? "Local, aucun appel réel" : "Réel (Twilio + ElevenLabs)"}
                </p>
              ) : null}
              {appel.twilioCallSid ? (
                <p>
                  <span className="text-muted-foreground">Twilio · </span>
                  {appel.twilioCallSid}
                </p>
              ) : null}
              {appel.detail ? <p className="text-muted-foreground">{appel.detail}</p> : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
