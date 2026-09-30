import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage() {
  const connected = await isAdmin();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-base text-muted-foreground">
          La lecture du carnet est ouverte. Seul l&apos;ajout d&apos;une recette demande le mot de
          passe administrateur.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{connected ? "Session ouverte" : "Administrateur"}</CardTitle>
          <CardDescription>
            {connected
              ? "Vous pouvez ajouter une recette ou fermer la session."
              : "Un seul compte administrateur, défini sur le serveur."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 text-base">
                <Link href="/ajouter">Ajouter une recette</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="h-12 w-full text-base">
                  Se déconnecter
                </Button>
              </form>
            </div>
          ) : (
            <LoginForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
