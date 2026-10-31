const MEDIA = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");

/** URL de la vignette d'un média, ou null si NEXT_PUBLIC_MEDIA_URL n'est pas renseignée. */
export function urlVignette(chemin: string | null | undefined): string | null {
  return MEDIA && chemin ? `${MEDIA}/${chemin}-thumb.webp` : null;
}
