"use client";

import { useActionState, useState } from "react";
import { scheduleCallAction } from "@/actions/dossiers";
import type { FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScheduleCallForm({
  dossierId,
  defaultPhone,
  defaultWhen,
}: {
  dossierId: string;
  defaultPhone: string;
  defaultWhen: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(scheduleCallAction, null);
  const [phone, setPhone] = useState(defaultPhone);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="dossierId" value={dossierId} />
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="scheduledAt">Date et heure</Label>
        <Input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          required
          defaultValue={defaultWhen}
          className="h-12 px-3 text-base md:text-base"
        />
        <p className="text-sm text-muted-foreground">
          Heure de Paris. Une heure déjà atteinte sera lancée au prochain déclenchement.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="callPhone">Téléphone appelé</Label>
        <Input
          id="callPhone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="h-12 px-3 text-base md:text-base"
        />
      </div>

      <SubmitButton label="Planifier l'appel" pendingLabel="Planification…" />
    </form>
  );
}
