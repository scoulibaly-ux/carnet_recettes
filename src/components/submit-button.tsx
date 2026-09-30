"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="h-12 w-full px-5 text-base sm:w-auto" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
