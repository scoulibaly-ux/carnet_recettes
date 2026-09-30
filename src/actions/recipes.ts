"use server";

import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { DatabaseUnavailableError, databaseMessage } from "@/lib/db";
import { inspectPhotoFile } from "@/lib/photos";
import { parseRecipeFields } from "@/lib/recipe-fields";
import { insertRecipe, isPublicBlobUrl } from "@/lib/recipes";
import type { FormState } from "@/actions/auth";

export async function createRecipeAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) {
    return { error: "Vous devez être connecté pour ajouter une recette." };
  }

  const parsed = parseRecipeFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return { error: "Ajoutez une photo de la recette." };
  }

  const inspection = await inspectPhotoFile(photo);
  if (!inspection.ok) return { error: inspection.error };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "Le stockage des photos n'est pas configuré." };
  }

  const id = randomUUID();
  let photoUrl: string | null = null;

  try {
    const blob = await put(`recettes/${id}.${inspection.extension}`, photo, {
      access: "public",
      contentType: inspection.contentType,
      addRandomSuffix: true,
    });
    photoUrl = blob.url;
  } catch {
    return { error: "Impossible d'enregistrer la photo pour le moment." };
  }

  if (!isPublicBlobUrl(photoUrl)) {
    return { error: "Impossible d'enregistrer la photo pour le moment." };
  }

  try {
    await insertRecipe({
      id,
      title: parsed.fields.title,
      ingredients: parsed.fields.ingredients,
      preparation: parsed.fields.preparation,
      photoUrl,
    });
  } catch (error) {
    await del(photoUrl).catch(() => undefined);
    if (error instanceof DatabaseUnavailableError) {
      return { error: databaseMessage(error.reason) };
    }
    return { error: "Impossible d'enregistrer la recette pour le moment." };
  }

  revalidatePath("/");
  revalidatePath(`/recettes/${id}`);
  redirect(`/recettes/${id}`);
}
