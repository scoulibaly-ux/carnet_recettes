"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(loginAction, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 px-3 text-base md:text-base"
          aria-invalid={state?.error ? true : undefined}
        />
      </div>
      <SubmitButton label="Se connecter" pendingLabel="Connexion…" />
    </form>
  );
}
