import Image from "next/image";
import { isPublicBlobUrl } from "@/lib/recipes";

export function RecipePhoto({
  src,
  alt,
  preload = false,
  sizes,
}: {
  src: string;
  alt: string;
  preload?: boolean;
  sizes: string;
}) {
  if (!isPublicBlobUrl(src)) {
    return (
      <div className="flex h-full items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
        Photo indisponible
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      preload={preload}
      sizes={sizes}
      className="object-cover"
    />
  );
}
