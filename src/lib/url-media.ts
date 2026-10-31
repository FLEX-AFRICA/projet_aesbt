/**
 * Racine des médias, servie par Caddy depuis le volume du VPS.
 *
 * Module pur (aucun accès réseau ni cookie) : utilisable côté serveur comme
 * côté client. `NEXT_PUBLIC_MEDIA_URL` est inlinée au build.
 */
const MEDIA = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");

let avertissementEmis = false;

/**
 * Avertit une seule fois par processus, côté serveur et hors tests, que la
 * variable est absente : les images référencées par identifiant ne peuvent
 * alors pas s'afficher.
 */
function avertirMediaAbsent(): void {
  if (avertissementEmis) return;
  if (typeof window !== "undefined") return;
  if (process.env.NODE_ENV === "test" || process.env["VITEST"]) return;
  avertissementEmis = true;
  console.warn(
    "[medias] NEXT_PUBLIC_MEDIA_URL n'est pas renseignée : les images référencées par identifiant ne peuvent pas s'afficher.",
  );
}

/**
 * URL publique des trois variantes d'un média.
 *
 * `chemin` est stocké sans extension ni suffixe côté backend : c'est ici que
 * les trois fichiers WebP sont reconstitués.
 */
export function urlsMedia(chemin: string | null): {
  src: string | null;
  srcSet: string | null;
  thumb: string | null;
} {
  if (!MEDIA) avertirMediaAbsent();
  if (!chemin || !MEDIA) return { src: null, srcSet: null, thumb: null };

  const original = `${MEDIA}/${chemin}.webp`;
  const md = `${MEDIA}/${chemin}-md.webp`;
  const thumb = `${MEDIA}/${chemin}-thumb.webp`;

  return {
    src: original,
    srcSet: `${thumb} 400w, ${md} 1200w, ${original} 2000w`,
    thumb,
  };
}
