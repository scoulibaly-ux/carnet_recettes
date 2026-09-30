import { cache } from "react";
import { getSql, rethrowDatabaseError } from "@/lib/db";

export type Recipe = {
  id: string;
  title: string;
  ingredients: string;
  preparation: string;
  photoUrl: string;
  createdAt: string;
};

type RecipeRow = {
  id: string;
  title: string;
  ingredients: string;
  preparation: string;
  photo_url: string;
  created_at: string | Date;
};

function toRecipe(row: RecipeRow): Recipe {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at);

  return {
    id: row.id,
    title: row.title,
    ingredients: row.ingredients,
    preparation: row.preparation,
    photoUrl: row.photo_url,
    createdAt,
  };
}

export function isPublicBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export const listRecipes = cache(async function listRecipes() {
  try {
    const sql = await getSql({ duringRender: true });
    const rows = (await sql`
      SELECT id, title, ingredients, preparation, photo_url, created_at
      FROM recipes
      ORDER BY created_at DESC
    `) as RecipeRow[];
    return rows.map(toRecipe);
  } catch (error) {
    rethrowDatabaseError(error);
  }
});

export const getRecipe = cache(async function getRecipe(id: string) {
  try {
    const sql = await getSql({ duringRender: true });
    const rows = (await sql`
      SELECT id, title, ingredients, preparation, photo_url, created_at
      FROM recipes
      WHERE id = ${id}
      LIMIT 1
    `) as RecipeRow[];
    const row = rows[0];
    return row ? toRecipe(row) : null;
  } catch (error) {
    rethrowDatabaseError(error);
  }
});

export async function insertRecipe(recipe: {
  id: string;
  title: string;
  ingredients: string;
  preparation: string;
  photoUrl: string;
}) {
  try {
    const sql = await getSql();
    await sql`
      INSERT INTO recipes (id, title, ingredients, preparation, photo_url)
      VALUES (
        ${recipe.id},
        ${recipe.title},
        ${recipe.ingredients},
        ${recipe.preparation},
        ${recipe.photoUrl}
      )
    `;
  } catch (error) {
    rethrowDatabaseError(error);
  }
}
