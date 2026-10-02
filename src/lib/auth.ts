import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { verifySessionValue } from "@/lib/session";

export const SESSION_COOKIE = "recouvrement_session";

export function readAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return secret;
}

export function readAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return password;
}

export const isAdmin = cache(async function isAdmin() {
  const secret = readAuthSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  return verifySessionValue(token, secret);
});
