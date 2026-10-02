import { isDossierStatus, type DossierStatus } from "@/lib/labels";
import { parseEurosToCents } from "@/lib/money";
import { parseScheduledAt } from "@/lib/paris-time";
import { normalizePhone } from "@/lib/phones";

const NAME_MAX = 120;
const REFERENCE_MAX = 80;
const NOTES_MAX = 2000;

export type DossierFields = {
  debtorName: string;
  phone: string;
  amountCents: number;
  reference: string;
  notes: string;
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim();
}

export function parseDossierFields(formData: FormData):
  | { ok: true; fields: DossierFields }
  | { ok: false; error: string } {
  const debtorName = readText(formData, "debtorName");
  const phone = normalizePhone(readText(formData, "phone"));
  const amountCents = parseEurosToCents(readText(formData, "amount"));
  const reference = readText(formData, "reference");
  const notes = readText(formData, "notes");

  if (!debtorName) return { ok: false, error: "Indiquez le nom du débiteur." };
  if (debtorName.length > NAME_MAX) {
    return { ok: false, error: "Le nom est trop long (120 caractères maximum)." };
  }
  if (!phone) {
    return {
      ok: false,
      error: "Indiquez un téléphone valide, par exemple 06 12 34 56 78 ou +33612345678.",
    };
  }
  if (amountCents == null) {
    return { ok: false, error: "Indiquez un montant dû supérieur à zéro, par exemple 1 250,00." };
  }
  if (reference.length > REFERENCE_MAX) {
    return { ok: false, error: "La référence est trop longue (80 caractères maximum)." };
  }
  if (notes.length > NOTES_MAX) {
    return { ok: false, error: "Les notes sont trop longues (2 000 caractères maximum)." };
  }

  return { ok: true, fields: { debtorName, phone, amountCents, reference, notes } };
}

export function parseDossierStatus(formData: FormData):
  | { ok: true; status: DossierStatus }
  | { ok: false; error: string } {
  const status = readText(formData, "status");
  if (!isDossierStatus(status)) return { ok: false, error: "Statut de dossier inconnu." };
  return { ok: true, status };
}

export function parseCallFields(formData: FormData, now = new Date()):
  | { ok: true; phone: string; scheduledAt: Date }
  | { ok: false; error: string } {
  const phone = normalizePhone(readText(formData, "phone"));
  const scheduledAt = parseScheduledAt(readText(formData, "scheduledAt"), now);
  if (!phone) {
    return {
      ok: false,
      error: "Indiquez un téléphone valide, par exemple 06 12 34 56 78 ou +33612345678.",
    };
  }
  if (!scheduledAt) {
    return {
      ok: false,
      error: "Indiquez une date et une heure valides (heure de Paris, au plus 24 h dans le passé).",
    };
  }
  return { ok: true, phone, scheduledAt };
}
