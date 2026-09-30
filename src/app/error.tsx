"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Un problème est survenu</h1>
      <p className="text-base text-muted-foreground">
        La page n&apos;a pas pu s&apos;afficher. Vous pouvez réessayer.
      </p>
      <Button type="button" onClick={() => reset()} className="h-11 w-fit px-4 text-base">
        Réessayer
      </Button>
    </div>
  );
}
