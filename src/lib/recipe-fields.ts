const TITLE_MAX = 120;
const INGREDIENTS_MAX = 5000;
const PREPARATION_MAX = 20000;

export type RecipeFields = {
  title: string;
  ingredients: string;
  preparation: string;
};

export function parseRecipeFields(formData: FormData):
  | { ok: true; fields: RecipeFields }
  | { ok: false; error: string } {
  const title = readText(formData, "title");
  const ingredients = readText(formData, "ingredients");
  const preparation = readText(formData, "preparation");

  if (!title) return { ok: false, error: "Indiquez un titre." };
  if (title.length > TITLE_MAX) {
    return { ok: false, error: "Le titre est trop long (120 caractères maximum)." };
  }
  if (!ingredients) return { ok: false, error: "Indiquez les ingrédients." };
  if (ingredients.length > INGREDIENTS_MAX) {
    return {
      ok: false,
      error: "La liste d'ingrédients est trop longue (5 000 caractères maximum).",
    };
  }
  if (!preparation) return { ok: false, error: "Décrivez la préparation." };
  if (preparation.length > PREPARATION_MAX) {
    return {
      ok: false,
      error: "La préparation est trop longue (20 000 caractères maximum).",
    };
  }

  return { ok: true, fields: { title, ingredients, preparation } };
}

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim();
}
