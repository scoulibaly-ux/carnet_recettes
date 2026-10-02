import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import {
  appelStatusLabel,
  dossierStatusLabel,
  type AppelStatus,
  type DossierStatus,
} from "@/lib/labels";

const dossierBadge: Record<DossierStatus, string> = {
  ouvert: "border-sky-700 bg-sky-600 text-white",
  en_relance: "border-amber-700 bg-amber-500 text-amber-950",
  clos: "border-emerald-800 bg-emerald-600 text-white",
};

const appelBadge: Record<AppelStatus, string> = {
  planifie: "border-sky-700 bg-sky-600 text-white",
  en_cours: "border-violet-700 bg-violet-600 text-white",
  termine: "border-emerald-800 bg-emerald-600 text-white",
  echec: "border-red-800 bg-red-600 text-white",
  simulation: "border-orange-700 bg-orange-500 text-orange-950",
};

export const dossierCardTone: Record<DossierStatus, string> = {
  ouvert: "bg-sky-50 ring-sky-300",
  en_relance: "bg-amber-50 ring-amber-300",
  clos: "bg-emerald-50 ring-emerald-300",
};

export const appelCardTone: Record<AppelStatus, string> = {
  planifie: "bg-sky-50 ring-sky-300",
  en_cours: "bg-violet-50 ring-violet-300",
  termine: "bg-emerald-50 ring-emerald-300",
  echec: "bg-red-50 ring-red-300",
  simulation: "bg-orange-50 ring-orange-300",
};

export const appelTextTone: Record<AppelStatus, string> = {
  planifie: "text-sky-800",
  en_cours: "text-violet-800",
  termine: "text-emerald-800",
  echec: "text-red-800",
  simulation: "text-orange-800",
};

export function DossierStatusBadge({ status }: { status: DossierStatus }) {
  return (
    <Badge variant="outline" className={cn("h-7 px-2.5 text-sm", dossierBadge[status])}>
      {dossierStatusLabel[status]}
    </Badge>
  );
}

export function AppelStatusBadge({ status }: { status: AppelStatus }) {
  return (
    <Badge variant="outline" className={cn("h-7 px-2.5 text-sm", appelBadge[status])}>
      {appelStatusLabel[status]}
    </Badge>
  );
}
