import "server-only";
import { neon } from "@neondatabase/serverless";
import { connection } from "next/server";

export type DatabaseProblem = "missing-config" | "missing-table" | "query";

export class DatabaseUnavailableError extends Error {
  readonly reason: DatabaseProblem;

  constructor(reason: DatabaseProblem) {
    super(reason);
    this.name = "DatabaseUnavailableError";
    this.reason = reason;
  }
}

export function databaseMessage(reason: DatabaseProblem) {
  if (reason === "missing-config") {
    return "La base de données n'est pas encore reliée. Renseignez DATABASE_URL, puis exécutez db/schema.sql.";
  }
  if (reason === "missing-table") {
    return "Les tables ne sont pas encore créées. Exécutez db/schema.sql dans Neon.";
  }
    return "Les dossiers sont momentanément indisponibles.";
}

export async function getSql(options?: { duringRender?: boolean }) {
  if (options?.duringRender) {
    await connection();
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new DatabaseUnavailableError("missing-config");
  }

  return neon(url);
}

export function rethrowDatabaseError(error: unknown): never {
  if (error instanceof DatabaseUnavailableError) throw error;

  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "42P01") {
    throw new DatabaseUnavailableError("missing-table");
  }

  throw new DatabaseUnavailableError("query");
}
