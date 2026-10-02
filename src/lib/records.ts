import type { AppelStatus, DossierStatus } from "@/lib/labels";

export type Dossier = {
  id: string;
  debtorName: string;
  phone: string;
  amountCents: number;
  reference: string;
  status: DossierStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Appel = {
  id: string;
  dossierId: string;
  phone: string;
  scheduledAt: string;
  status: AppelStatus;
  mode: "reel" | "local" | null;
  startedAt: string | null;
  endedAt: string | null;
  twilioCallSid: string | null;
  elevenLabsConversationId: string | null;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
  debtorName: string;
  reference: string;
};

export type NewDossier = {
  id: string;
  debtorName: string;
  phone: string;
  amountCents: number;
  reference: string;
  status: DossierStatus;
  notes: string;
};

export type NewAppel = {
  id: string;
  dossierId: string;
  phone: string;
  scheduledAt: string;
};

export type AppelPatch = Partial<
  Pick<
    Appel,
    | "status"
    | "mode"
    | "startedAt"
    | "endedAt"
    | "twilioCallSid"
    | "elevenLabsConversationId"
    | "detail"
  >
>;

export const DOSSIER_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRecordId(value: string) {
  return DOSSIER_ID.test(value);
}
