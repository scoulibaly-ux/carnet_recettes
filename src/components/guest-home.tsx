import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GuestHome() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Recouvrement
        </h1>
        <p className="text-base text-muted-foreground">
          Dossiers débiteurs, appels planifiés, et journal des relances vocales.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accès réservé</CardTitle>
          <CardDescription>
            Les dossiers et les numéros ne sont visibles qu&apos;après connexion administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="h-12 px-5 text-base">
            <Link href="/connexion">Connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
