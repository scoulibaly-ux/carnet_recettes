"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/actions/auth";
import { isAdmin } from "@/lib/auth";
import { DatabaseUnavailableError, databaseMessage } from "@/lib/db";
import { parseCallFields, parseDossierFields, parseDossierStatus } from "@/lib/fields";
import { getRepository } from "@/lib/repository";
import { isRecordId } from "@/lib/records";

export async function createDossierAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) {
    return { error: "Vous devez être connecté pour créer un dossier." };
  }

  const parsed = parseDossierFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  const id = randomUUID();
  try {
    const repository = await getRepository();
    await repository.insertDossier({
      id,
      debtorName: parsed.fields.debtorName,
      phone: parsed.fields.phone,
      amountCents: parsed.fields.amountCents,
      reference: parsed.fields.reference,
      status: "ouvert",
      notes: parsed.fields.notes,
    });
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return { error: databaseMessage(error.reason) };
    }
    return { error: "Impossible d'enregistrer le dossier pour le moment." };
  }

  revalidatePath("/", "layout");
  redirect(`/dossiers/${id}`);
}

export async function updateDossierStatusAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) {
    return { error: "Vous devez être connecté pour modifier un dossier." };
  }

  const id = formData.get("dossierId");
  if (typeof id !== "string" || !isRecordId(id)) {
    return { error: "Dossier introuvable." };
  }

  const parsed = parseDossierStatus(formData);
  if (!parsed.ok) return { error: parsed.error };

  try {
    const repository = await getRepository();
    const updated = await repository.updateDossierStatus(id, parsed.status);
    if (!updated) return { error: "Dossier introuvable." };
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return { error: databaseMessage(error.reason) };
    }
    return { error: "Impossible de mettre à jour le statut pour le moment." };
  }

  revalidatePath("/", "layout");
  return null;
}

export async function scheduleCallAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) {
    return { error: "Vous devez être connecté pour planifier un appel." };
  }

  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string" || !isRecordId(dossierId)) {
    return { error: "Dossier introuvable." };
  }

  const parsed = parseCallFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  try {
    const repository = await getRepository();
    const dossier = await repository.getDossier(dossierId);
    if (!dossier) return { error: "Dossier introuvable." };
    if (dossier.status === "clos") {
      return { error: "Ce dossier est clos. Rouvrez-le avant de planifier un appel." };
    }

    await repository.insertAppel({
      id: randomUUID(),
      dossierId,
      phone: parsed.phone,
      scheduledAt: parsed.scheduledAt.toISOString(),
    });

    if (dossier.status === "ouvert") {
      await repository.updateDossierStatus(dossierId, "en_relance");
    }
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return { error: databaseMessage(error.reason) };
    }
    return { error: "Impossible de planifier l'appel pour le moment." };
  }

  revalidatePath("/", "layout");
  redirect(`/dossiers/${dossierId}`);
}
