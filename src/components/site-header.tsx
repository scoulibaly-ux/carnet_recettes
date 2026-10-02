import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SiteHeader({ connected }: { connected: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
          <PhoneCall className="size-5 text-primary" aria-hidden="true" />
          <span>Recouvrement</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Navigation">
          <Button asChild variant="ghost" className="h-11 px-3 text-base">
            <Link href="/">Dossiers</Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 px-3 text-base">
            <Link href="/appels">Journal</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-3 text-base">
            <Link href="/dossiers/nouveau">Nouveau</Link>
          </Button>
          {connected ? (
            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="h-11 px-3 text-base">
                Se déconnecter
              </Button>
            </form>
          ) : (
            <Button asChild variant="outline" className="h-11 px-3 text-base">
              <Link href="/connexion">Connexion</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
