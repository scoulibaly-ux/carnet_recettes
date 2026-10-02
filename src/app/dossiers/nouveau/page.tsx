import type { Metadata } from "next";
import { DossierForm } from "@/components/dossier-form";
import { GuestHome } from "@/components/guest-home";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau dossier",
};

export default async function NewDossierPage() {
  const connected = await isAdmin();
  if (!connected) return <GuestHome />;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Nouveau dossier</h1>
        <p className="text-base text-muted-foreground">
          Identité du débiteur, téléphone et montant dû. Le statut de départ est ouvert.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Débiteur</CardTitle>
          <CardDescription>Ces informations serviront à l&apos;agent vocal lors de l&apos;appel.</CardDescription>
        </CardHeader>
        <CardContent>
          <DossierForm />
        </CardContent>
      </Card>
    </div>
  );
}
