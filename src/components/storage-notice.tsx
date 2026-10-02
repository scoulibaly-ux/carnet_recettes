import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { TelephonyDecision } from "@/lib/telephony-mode";
import type { RepositoryKind } from "@/lib/repository";

export function StorageNotice({ kind }: { kind: RepositoryKind }) {
  if (kind !== "fichier") return null;
  return (
    <Alert>
      <AlertTitle>Stockage local</AlertTitle>
      <AlertDescription>
        DATABASE_URL est absente. Les dossiers de ce serveur de développement sont enregistrés dans
        un fichier sur cette machine, pas dans Neon. En production, la base est obligatoire.
      </AlertDescription>
    </Alert>
  );
}

export function TelephonyNotice({ decision }: { decision: TelephonyDecision }) {
  if (decision.mode === "reel") {
    return (
      <Alert>
        <AlertTitle>Appels réels</AlertTitle>
        <AlertDescription>
          Twilio compose le numéro. À la connexion, ElevenLabs conduit la conversation.
        </AlertDescription>
      </Alert>
    );
  }

  if (decision.mode === "local") {
    return (
      <Alert>
        <AlertTitle>Mode local</AlertTitle>
        <AlertDescription>
          Les clés Twilio et ElevenLabs sont absentes. Le déclencheur ne compose aucun numéro et
          marque les appels dus « Simulation locale ». Ce n&apos;est pas un appel réussi.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>Téléphonie non configurée</AlertTitle>
      <AlertDescription>
        {decision.detail} Un déclenchement marquera l&apos;appel en échec.
      </AlertDescription>
    </Alert>
  );
}
