import "server-only";
import { getSql, rethrowDatabaseError } from "@/lib/db";
import { isAppelStatus, isDossierStatus, type AppelStatus, type DossierStatus } from "@/lib/labels";
import type { Appel, AppelPatch, Dossier, NewAppel, NewDossier } from "@/lib/records";
import type { Repository } from "@/lib/repository";

type DossierRow = {
  id: string;
  debtor_name: string;
  phone: string;
  amount_cents: number | string;
  reference: string;
  status: string;
  notes: string;
  created_at: string | Date;
  updated_at: string | Date;
};

type AppelRow = {
  id: string;
  dossier_id: string;
  phone: string;
  scheduled_at: string | Date;
  status: string;
  mode: string | null;
  started_at: string | Date | null;
  ended_at: string | Date | null;
  twilio_call_sid: string | null;
  elevenlabs_conversation_id: string | null;
  detail: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  debtor_name: string | null;
  reference: string | null;
};

function toIso(value: string | Date | null) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

function toDossier(row: DossierRow): Dossier {
  return {
    id: row.id,
    debtorName: row.debtor_name,
    phone: row.phone,
    amountCents: Number(row.amount_cents),
    reference: row.reference,
    status: isDossierStatus(row.status) ? row.status : "ouvert",
    notes: row.notes,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
  };
}

function toMode(value: string | null): Appel["mode"] {
  if (value === "reel" || value === "local") return value;
  return null;
}

function toAppel(row: AppelRow): Appel {
  const status: AppelStatus = isAppelStatus(row.status) ? row.status : "echec";
  return {
    id: row.id,
    dossierId: row.dossier_id,
    phone: row.phone,
    scheduledAt: toIso(row.scheduled_at) ?? new Date(0).toISOString(),
    status,
    mode: toMode(row.mode),
    startedAt: toIso(row.started_at),
    endedAt: toIso(row.ended_at),
    twilioCallSid: row.twilio_call_sid,
    elevenLabsConversationId: row.elevenlabs_conversation_id,
    detail: row.detail,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
    debtorName: row.debtor_name ?? "Dossier introuvable",
    reference: row.reference ?? "",
  };
}

export function createNeonRepository(): Repository {
  return {
    kind: "neon",
    async listDossiers() {
      try {
        const sql = await getSql();
        const rows = (await sql`
          SELECT id, debtor_name, phone, amount_cents, reference, status, notes, created_at, updated_at
          FROM dossiers
          ORDER BY created_at DESC
        `) as DossierRow[];
        return rows.map(toDossier);
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async getDossier(id) {
      try {
        const sql = await getSql();
        const rows = (await sql`
          SELECT id, debtor_name, phone, amount_cents, reference, status, notes, created_at, updated_at
          FROM dossiers
          WHERE id = ${id}
          LIMIT 1
        `) as DossierRow[];
        return rows[0] ? toDossier(rows[0]) : null;
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async insertDossier(dossier: NewDossier) {
      try {
        const sql = await getSql();
        await sql`
          INSERT INTO dossiers (
            id, debtor_name, phone, amount_cents, reference, status, notes
          ) VALUES (
            ${dossier.id},
            ${dossier.debtorName},
            ${dossier.phone},
            ${dossier.amountCents},
            ${dossier.reference},
            ${dossier.status},
            ${dossier.notes}
          )
        `;
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async updateDossierStatus(id, status: DossierStatus) {
      try {
        const sql = await getSql();
        const rows = (await sql`
          UPDATE dossiers
          SET status = ${status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id
        `) as { id: string }[];
        return rows.length > 0;
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async listAppels() {
      try {
        const sql = await getSql();
        const rows = (await sql`
          SELECT
            a.id, a.dossier_id, a.phone, a.scheduled_at, a.status, a.mode,
            a.started_at, a.ended_at, a.twilio_call_sid, a.elevenlabs_conversation_id,
            a.detail, a.created_at, a.updated_at, d.debtor_name, d.reference
          FROM appels a
          LEFT JOIN dossiers d ON d.id = a.dossier_id
          ORDER BY a.scheduled_at DESC
        `) as AppelRow[];
        return rows.map(toAppel);
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async getAppel(id) {
      try {
        const sql = await getSql();
        const rows = (await sql`
          SELECT
            a.id, a.dossier_id, a.phone, a.scheduled_at, a.status, a.mode,
            a.started_at, a.ended_at, a.twilio_call_sid, a.elevenlabs_conversation_id,
            a.detail, a.created_at, a.updated_at, d.debtor_name, d.reference
          FROM appels a
          LEFT JOIN dossiers d ON d.id = a.dossier_id
          WHERE a.id = ${id}
          LIMIT 1
        `) as AppelRow[];
        return rows[0] ? toAppel(rows[0]) : null;
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async insertAppel(appel: NewAppel) {
      try {
        const sql = await getSql();
        await sql`
          INSERT INTO appels (id, dossier_id, phone, scheduled_at, status)
          VALUES (
            ${appel.id},
            ${appel.dossierId},
            ${appel.phone},
            ${appel.scheduledAt}::timestamptz,
            'planifie'
          )
        `;
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async listDueAppelIds(now, limit) {
      try {
        const sql = await getSql();
        const rows = (await sql`
          SELECT id
          FROM appels
          WHERE status = 'planifie' AND scheduled_at <= ${now.toISOString()}::timestamptz
          ORDER BY scheduled_at ASC
          LIMIT ${limit}
        `) as { id: string }[];
        return rows.map((row) => row.id);
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async claimDueAppel(id, now) {
      try {
        const sql = await getSql();
        const rows = (await sql`
          UPDATE appels
          SET status = 'en_cours', started_at = ${now.toISOString()}::timestamptz, updated_at = NOW()
          WHERE id = ${id}
            AND status = 'planifie'
            AND scheduled_at <= ${now.toISOString()}::timestamptz
          RETURNING id
        `) as { id: string }[];
        return rows.length > 0;
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
    async saveAppel(id, patch: AppelPatch) {
      try {
        const current = await this.getAppel(id);
        if (!current) return null;
        const next = { ...current, ...patch };
        if (!isAppelStatus(next.status)) return null;
        const sql = await getSql();
        await sql`
          UPDATE appels
          SET
            status = ${next.status},
            mode = ${next.mode},
            started_at = ${next.startedAt}::timestamptz,
            ended_at = ${next.endedAt}::timestamptz,
            twilio_call_sid = ${next.twilioCallSid},
            elevenlabs_conversation_id = ${next.elevenLabsConversationId},
            detail = ${next.detail},
            updated_at = NOW()
          WHERE id = ${id}
        `;
        return { ...next, updatedAt: new Date().toISOString() };
      } catch (error) {
        rethrowDatabaseError(error);
      }
    },
  };
}
