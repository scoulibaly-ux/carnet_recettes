"use client";

import { useActionState, useState } from "react";
import { createDossierAction } from "@/actions/dossiers";
import type { FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DossierForm() {
  const [state, action] = useActionState<FormState, FormData>(createDossierAction, null);
  const [debtorName, setDebtorName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="debtorName">Débiteur</Label>
        <Input
          id="debtorName"
          name="debtorName"
          required
          maxLength={120}
          autoComplete="name"
          value={debtorName}
          onChange={(event) => setDebtorName(event.target.value)}
          placeholder="Camille Martin"
          className="h-12 px-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="06 12 34 56 78"
          className="h-12 px-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Montant dû (€)</Label>
        <Input
          id="amount"
          name="amount"
          inputMode="decimal"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="1 250,00"
          className="h-12 px-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reference">Référence</Label>
        <Input
          id="reference"
          name="reference"
          maxLength={80}
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="FAC-2026-014"
          className="h-12 px-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Facture échue, premier rappel."
          className="min-h-28 px-3 py-3 text-base md:text-base"
        />
      </div>

      <SubmitButton label="Créer le dossier" pendingLabel="Enregistrement…" />
    </form>
  );
}
