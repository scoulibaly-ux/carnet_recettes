import { Badge } from "@/components/ui/badge";
import {
  appelStatusLabel,
  dossierStatusLabel,
  type AppelStatus,
  type DossierStatus,
} from "@/lib/labels";

export function DossierStatusBadge({ status }: { status: DossierStatus }) {
  const variant = status === "en_relance" ? "default" : status === "clos" ? "secondary" : "outline";
  return <Badge variant={variant}>{dossierStatusLabel[status]}</Badge>;
}

export function AppelStatusBadge({ status }: { status: AppelStatus }) {
  if (status === "simulation") {
    return (
      <Badge variant="outline" className="border-amber-700/40 bg-amber-50 text-amber-950">
        {appelStatusLabel[status]}
      </Badge>
    );
  }
  const variant =
    status === "en_cours" ? "default" : status === "echec" ? "destructive" : status === "termine" ? "secondary" : "outline";
  return <Badge variant={variant}>{appelStatusLabel[status]}</Badge>;
}
