import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseNotice } from "@/components/database-notice";
import { RecipePhoto } from "@/components/recipe-photo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DatabaseUnavailableError, type DatabaseProblem } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getRecipe } from "@/lib/recipes";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return { title: "Recette introuvable" };

  try {
    const recipe = await getRecipe(id);
    if (!recipe) return { title: "Recette introuvable" };
    return {
      title: recipe.title,
      description: recipe.ingredients.slice(0, 140),
    };
  } catch {
    return { title: "Recette" };
  }
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  let problem: DatabaseProblem | null = null;
  let recipe = null;

  try {
    recipe = await getRecipe(id);
  } catch (error) {
    problem = error instanceof DatabaseUnavailableError ? error.reason : "query";
  }

  if (problem) {
    return (
      <div className="flex flex-col gap-4">
        <DatabaseNotice reason={problem} />
        <Button asChild variant="outline" className="h-11 w-fit px-4 text-base">
          <Link href="/">Retour aux recettes</Link>
        </Button>
      </div>
    );
  }

  if (!recipe) notFound();

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" className="h-11 w-fit px-2 text-base">
          <Link href="/">← Toutes les recettes</Link>
        </Button>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {recipe.title}
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate(recipe.createdAt)}</p>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted sm:aspect-[16/10]">
        <RecipePhoto
          src={recipe.photoUrl}
          alt={`Photo de ${recipe.title}`}
          preload
          sizes="(max-width: 1024px) 100vw, 64rem"
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Ingrédients</h2>
        <p className="whitespace-pre-wrap text-base leading-7">{recipe.ingredients}</p>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Préparation</h2>
        <p className="whitespace-pre-wrap text-base leading-7">{recipe.preparation}</p>
      </section>
    </article>
  );
}
