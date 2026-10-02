"use client";

import { useActionState } from "react";
import { updateDossierStatusAction } from "@/actions/dossiers";
import type { FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { dossierStatusLabel, DOSSIER_STATUSES, type DossierStatus } from "@/lib/labels";

export function DossierStatusForm({
  dossierId,
  status,
}: {
  dossierId: string;
  status: DossierStatus;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateDossierStatusAction, null);

  return (
    <form key={status} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="dossierId" value={dossierId} />
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Statut du dossier</Label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="h-12 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {DOSSIER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {dossierStatusLabel[value]}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton label="Mettre à jour le statut" pendingLabel="Mise à jour…" />
    </form>
  );
}
