import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { urlVignette } from "./medias";

/** Petite image de liste (couverture, photo) ; décorative, le texte voisin porte le sens. */
export function Vignette({
  chemin,
  url: urlDirecte,
  className,
}: {
  /** Chemin du média (l'URL de vignette en est déduite). */
  chemin?: string | null | undefined;
  /** URL déjà calculée (sélecteur de médias), prioritaire sur `chemin`. */
  url?: string | null | undefined;
  className?: string;
}) {
  const url = urlDirecte ?? urlVignette(chemin);
  return (
    <span
      className={cn(
        "grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-frost text-muted-ink",
        className,
      )}
    >
      {url ? (
        <img src={url} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <ImageIcon aria-hidden="true" className="size-5" />
      )}
    </span>
  );
}
