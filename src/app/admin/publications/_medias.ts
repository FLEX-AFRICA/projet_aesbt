import { appelApi } from "@/lib/api-admin";

import type { MediaChoisissable } from "../_kit";

const MEDIA = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");

/** Médias proposés comme couverture, les plus récents d'abord. */
export async function mediasDisponibles(): Promise<MediaChoisissable[]> {
  try {
    const { medias } = await appelApi<{
      medias: { id: string; alt: string; chemin: string }[];
    }>("/api/v1/admin/medias?taille=60");

    return medias.map((m) => ({
      id: m.id,
      alt: m.alt,
      vignette: MEDIA ? `${MEDIA}/${m.chemin}-thumb.webp` : null,
    }));
  } catch {
    // La médiathèque indisponible ne doit pas empêcher d'écrire.
    return [];
  }
}
