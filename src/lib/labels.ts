export const DOSSIER_STATUSES = ["ouvert", "en_relance", "clos"] as const;
export type DossierStatus = (typeof DOSSIER_STATUSES)[number];

export const APPEL_STATUSES = ["planifie", "en_cours", "termine", "echec", "simulation"] as const;
export type AppelStatus = (typeof APPEL_STATUSES)[number];

export const dossierStatusLabel: Record<DossierStatus, string> = {
  ouvert: "Ouvert",
  en_relance: "En relance",
  clos: "Clos",
};

export const appelStatusLabel: Record<AppelStatus, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  echec: "Échec",
  simulation: "Simulation locale",
};

export function isDossierStatus(value: string): value is DossierStatus {
  return (DOSSIER_STATUSES as readonly string[]).includes(value);
}

export function isAppelStatus(value: string): value is AppelStatus {
  return (APPEL_STATUSES as readonly string[]).includes(value);
}
