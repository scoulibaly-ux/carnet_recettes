import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseUnavailableError } from "@/lib/db";
import { isAppelStatus, isDossierStatus } from "@/lib/labels";
import type { Appel, AppelPatch, Dossier, NewAppel, NewDossier } from "@/lib/records";
import type { Repository } from "@/lib/repository";

type AppelRecord = Omit<Appel, "debtorName" | "reference">;

type FileData = {
  dossiers: Dossier[];
  appels: AppelRecord[];
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "recouvrement.json");

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>) {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function emptyData(): FileData {
  return { dossiers: [], appels: [] };
}

async function readData(): Promise<FileData> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileData>;
    if (!Array.isArray(parsed.dossiers) || !Array.isArray(parsed.appels)) {
      throw new Error("shape");
    }
    return { dossiers: parsed.dossiers, appels: parsed.appels };
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";
    if (code === "ENOENT") return emptyData();
    throw new DatabaseUnavailableError("query");
  }
}

async function writeData(data: FileData) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

function joinAppel(appel: AppelRecord, dossiers: Dossier[]): Appel {
  const dossier = dossiers.find((item) => item.id === appel.dossierId);
  return {
    ...appel,
    debtorName: dossier?.debtorName ?? "Dossier introuvable",
    reference: dossier?.reference ?? "",
  };
}

function compareIso(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function createFileRepository(): Repository {
  return {
    kind: "fichier",
    async listDossiers() {
      const data = await withLock(readData);
      return [...data.dossiers].sort((a, b) => compareIso(b.createdAt, a.createdAt));
    },
    async getDossier(id) {
      const data = await withLock(readData);
      return data.dossiers.find((dossier) => dossier.id === id) ?? null;
    },
    async insertDossier(dossier: NewDossier) {
      await withLock(async () => {
        const data = await readData();
        const now = new Date().toISOString();
        data.dossiers.push({ ...dossier, createdAt: now, updatedAt: now });
        await writeData(data);
      });
    },
    async updateDossierStatus(id, status) {
      return withLock(async () => {
        const data = await readData();
        const dossier = data.dossiers.find((item) => item.id === id);
        if (!dossier || !isDossierStatus(status)) return false;
        dossier.status = status;
        dossier.updatedAt = new Date().toISOString();
        await writeData(data);
        return true;
      });
    },
    async listAppels() {
      const data = await withLock(readData);
      return data.appels
        .map((appel) => joinAppel(appel, data.dossiers))
        .sort((a, b) => compareIso(b.scheduledAt, a.scheduledAt));
    },
    async getAppel(id) {
      const data = await withLock(readData);
      const appel = data.appels.find((item) => item.id === id);
      return appel ? joinAppel(appel, data.dossiers) : null;
    },
    async insertAppel(appel: NewAppel) {
      await withLock(async () => {
        const data = await readData();
        if (!data.dossiers.some((dossier) => dossier.id === appel.dossierId)) {
          throw new DatabaseUnavailableError("query");
        }
        const now = new Date().toISOString();
        data.appels.push({
          ...appel,
          status: "planifie",
          mode: null,
          startedAt: null,
          endedAt: null,
          twilioCallSid: null,
          elevenLabsConversationId: null,
          detail: null,
          createdAt: now,
          updatedAt: now,
        });
        await writeData(data);
      });
    },
    async listDueAppelIds(now, limit) {
      const data = await withLock(readData);
      return data.appels
        .filter((appel) => appel.status === "planifie" && appel.scheduledAt <= now.toISOString())
        .sort((a, b) => compareIso(a.scheduledAt, b.scheduledAt))
        .slice(0, limit)
        .map((appel) => appel.id);
    },
    async claimDueAppel(id, now) {
      return withLock(async () => {
        const data = await readData();
        const appel = data.appels.find((item) => item.id === id);
        if (!appel || appel.status !== "planifie" || appel.scheduledAt > now.toISOString()) {
          return false;
        }
        const stamp = now.toISOString();
        appel.status = "en_cours";
        appel.startedAt = stamp;
        appel.updatedAt = stamp;
        await writeData(data);
        return true;
      });
    },
    async saveAppel(id, patch: AppelPatch) {
      return withLock(async () => {
        const data = await readData();
        const appel = data.appels.find((item) => item.id === id);
        if (!appel) return null;
        if (patch.status && !isAppelStatus(patch.status)) return null;
        Object.assign(appel, patch, { updatedAt: new Date().toISOString() });
        await writeData(data);
        return joinAppel(appel, data.dossiers);
      });
    },
  };
}
