"use client";

import { useActionState, useState } from "react";
import { createRecipeAction } from "@/actions/recipes";
import type { FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RecipeForm() {
  const [state, action] = useActionState<FormState, FormData>(createRecipeAction, null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparation, setPreparation] = useState("");

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Tarte aux pommes"
          className="h-12 px-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ingredients">Ingrédients</Label>
        <Textarea
          id="ingredients"
          name="ingredients"
          required
          rows={6}
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          placeholder={"4 pommes\n1 pâte brisée\n40 g de sucre"}
          className="min-h-36 px-3 py-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preparation">Préparation</Label>
        <Textarea
          id="preparation"
          name="preparation"
          required
          rows={8}
          value={preparation}
          onChange={(event) => setPreparation(event.target.value)}
          placeholder="Préchauffer le four, étaler la pâte, disposer les pommes…"
          className="min-h-44 px-3 py-3 text-base md:text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="photo">Photo</Label>
        <Input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="h-12 px-3 py-2 text-base md:text-base"
        />
        <p className="text-sm text-muted-foreground">JPEG, PNG ou WebP, 4 Mo maximum.</p>
      </div>

      <SubmitButton label="Enregistrer la recette" pendingLabel="Enregistrement…" />
    </form>
  );
}
