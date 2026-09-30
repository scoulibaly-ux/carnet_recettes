import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Page introuvable</h1>
      <p className="text-base text-muted-foreground">
        Cette recette n&apos;existe pas, ou le lien est incomplet.
      </p>
      <Button asChild className="h-11 w-fit px-4 text-base">
        <Link href="/">Retour aux recettes</Link>
      </Button>
    </div>
  );
}
