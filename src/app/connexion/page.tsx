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
          Un seul administrateur, défini sur le serveur. Les dossiers restent cachés sans session.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{connected ? "Session ouverte" : "Administrateur"}</CardTitle>
          <CardDescription>
            {connected
              ? "Vous pouvez gérer les dossiers ou fermer la session."
              : "Mot de passe administrateur, rien d'autre."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 text-base">
                <Link href="/">Voir les dossiers</Link>
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
