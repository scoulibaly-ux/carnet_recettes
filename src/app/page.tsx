import Link from "next/link";
import { DatabaseNotice } from "@/components/database-notice";
import { RecipePhoto } from "@/components/recipe-photo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseUnavailableError } from "@/lib/db";
import { formatDate, previewText } from "@/lib/format";
import { listRecipes, type Recipe } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recipes: Recipe[] = [];
  let problem: "missing-config" | "missing-table" | "query" | null = null;

  try {
    recipes = await listRecipes();
  } catch (error) {
    problem = error instanceof DatabaseUnavailableError ? error.reason : "query";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Mon carnet de recettes
          </h1>
          <p className="text-base text-muted-foreground">
            Les plats à refaire, avec la photo, les ingrédients et la préparation.
          </p>
        </div>
        <Button asChild className="h-12 px-5 text-base">
          <Link href="/ajouter">Ajouter une recette</Link>
        </Button>
      </div>

      {problem ? <DatabaseNotice reason={problem} /> : null}

      {!problem && recipes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune recette pour le moment</CardTitle>
            <CardDescription>
              Connectez-vous pour ajouter la première fiche du carnet.
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t-0 bg-transparent">
            <Button asChild variant="outline" className="h-11 px-4 text-base">
              <Link href="/connexion">Connexion</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {recipes.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Card className="h-full">
                <div className="relative aspect-[4/3] bg-muted">
                  <RecipePhoto
                    src={recipe.photoUrl}
                    alt={`Photo de ${recipe.title}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <CardDescription>{formatDate(recipe.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {previewText(recipe.ingredients, 120)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="h-11 w-full text-base">
                    <Link href={`/recettes/${recipe.id}`}>Voir la recette</Link>
                  </Button>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
