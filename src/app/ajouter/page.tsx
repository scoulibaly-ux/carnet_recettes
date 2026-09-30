import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ajouter une recette",
};

export default async function AddRecipePage() {
  if (!(await isAdmin())) {
    redirect("/connexion");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Ajouter une recette</h1>
        <p className="text-base text-muted-foreground">
          Titre, ingrédients, préparation et une photo. La fiche est visible par tout le monde.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle fiche</CardTitle>
          <CardDescription>Tous les champs sont obligatoires.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeForm />
        </CardContent>
      </Card>
    </div>
  );
}
