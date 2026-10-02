import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { databaseMessage, type DatabaseProblem } from "@/lib/db";

export function DatabaseNotice({ reason }: { reason: DatabaseProblem }) {
  return (
    <Alert>
      <AlertTitle>Données indisponibles</AlertTitle>
      <AlertDescription>{databaseMessage(reason)}</AlertDescription>
    </Alert>
  );
}
