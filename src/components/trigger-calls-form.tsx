"use client";

import { useActionState } from "react";
import { triggerDueCallsAction, type TriggerState } from "@/actions/appels";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function TriggerCallsForm() {
  const [state, action] = useActionState<TriggerState, FormData>(triggerDueCallsAction, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state?.notice ? (
        <Alert>
          <AlertDescription>{state.notice}</AlertDescription>
        </Alert>
      ) : null}
      <SubmitButton label="Lancer les appels dus" pendingLabel="Lancement…" />
      <p className="text-sm text-muted-foreground">
        Prend jusqu&apos;à 5 appels dont l&apos;heure planifiée est atteinte.
      </p>
    </form>
  );
}
