import "server-only";
import { connection } from "next/server";
import { DatabaseUnavailableError } from "@/lib/db";
import { createFileRepository } from "@/lib/file-repository";
import { createNeonRepository } from "@/lib/neon-repository";
import type { DossierStatus } from "@/lib/labels";
import type { Appel, AppelPatch, Dossier, NewAppel, NewDossier } from "@/lib/records";

export type RepositoryKind = "neon" | "fichier";

export type Repository = {
  kind: RepositoryKind;
  listDossiers(): Promise<Dossier[]>;
  getDossier(id: string): Promise<Dossier | null>;
  insertDossier(dossier: NewDossier): Promise<void>;
  updateDossierStatus(id: string, status: DossierStatus): Promise<boolean>;
  listAppels(): Promise<Appel[]>;
  getAppel(id: string): Promise<Appel | null>;
  insertAppel(appel: NewAppel): Promise<void>;
  listDueAppelIds(now: Date, limit: number): Promise<string[]>;
  claimDueAppel(id: string, now: Date): Promise<boolean>;
  saveAppel(id: string, patch: AppelPatch): Promise<Appel | null>;
};

export async function getRepository(): Promise<Repository> {
  if (process.env.DATABASE_URL?.trim()) return createNeonRepository();
  if (process.env.NODE_ENV !== "production") return createFileRepository();
  throw new DatabaseUnavailableError("missing-config");
}

export async function readRepository() {
  await connection();
  return getRepository();
}
