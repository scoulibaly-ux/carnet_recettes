"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readAdminPassword, readAuthSecret } from "@/lib/auth";
import { createSessionValue, passwordsMatch, sessionCookieOptions } from "@/lib/session";

export type FormState = { error: string } | null;

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const secret = readAuthSecret();
  const expected = readAdminPassword();
  if (!secret || !expected) {
    return {
      error: "La connexion administrateur n'est pas configurée sur le serveur.",
    };
  }

  const submitted = formData.get("password");
  if (typeof submitted !== "string" || submitted.length === 0) {
    return { error: "Indiquez le mot de passe." };
  }
  if (submitted.length > 200 || !passwordsMatch(submitted, expected, secret)) {
    return { error: "Mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(secret), sessionCookieOptions());
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}
