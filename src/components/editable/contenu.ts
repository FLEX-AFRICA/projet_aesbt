import type { ValeurContenu } from "@/contenus/defauts";
import type { Contenus, Medias } from "@/lib/contenus";
import { urlsMedia } from "@/lib/url-media";

/**
 * Accès aux contenus hors JSX (alt, href, aria-label) et utilitaires purs,
 * utilisables côté serveur comme côté client.
 *
 * Piège inventaire 6.3 : plusieurs textes servent d'attribut (alt, aria-label)
 * et non de nœud ; un `<Editable>` ne peut pas les servir, d'où ces fonctions.
 * Côté client, préférer le hook `useContenu` (il suit l'aperçu en direct).
 */

/** Valeur brute d'une clé, `undefined` si la clé n'existe pas. */
export function contenu(contenus: Contenus, cle: string): ValeurContenu | undefined {
  return contenus[cle];
}

/**
 * Valeur texte d'une clé.
 *
 * Piège inventaire 6.8 : une valeur `null`, vide ou non textuelle signifie
 * « utiliser le repli du composant », pas « afficher une chaîne vide ».
 */
export function texteDe(valeur: ValeurContenu | undefined, repli = ""): string {
  if (typeof valeur === "number") return String(valeur);
  if (typeof valeur === "string" && valeur.trim() !== "") return valeur;
  return repli;
}

export function contenuTexte(contenus: Contenus, cle: string, repli = ""): string {
  return texteDe(contenus[cle], repli);
}

/** Forme d'un identifiant de média (alignée sur le registre du backend). */
const ID_MEDIA = /^[A-Za-z0-9_-]{6,64}$/;

/**
 * URL affichable d'une valeur d'image.
 *
 * - chemin public (`/...`) ou URL http(s) : renvoyé tel quel (c'est aussi ce
 *   que l'éditeur envoie par postMessage pour l'aperçu en direct) ;
 * - identifiant de média : résolu avec la table `medias` de l'API, puis
 *   `urlsMedia` (`NEXT_PUBLIC_MEDIA_URL`, chemin sans extension, variante
 *   d'origine en WebP) ;
 * - sinon (id absent de la table, média non configuré, valeur nulle) : null,
 *   ce qui déclenche le rendu de repli du composant.
 */
export function urlImage(valeur: ValeurContenu | undefined, medias?: Medias): string | null {
  if (typeof valeur !== "string") return null;
  if (valeur.startsWith("/") && !valeur.startsWith("//")) return valeur;
  if (/^https?:\/\//i.test(valeur)) return valeur;
  if (ID_MEDIA.test(valeur)) {
    const media = medias?.[valeur];
    if (media) return urlsMedia(media.chemin).src;
  }
  return null;
}

/** Éléments d'une valeur de type liste (tableau vide si ce n'en est pas une). */
export function elementsDe(
  valeur: ValeurContenu | undefined,
): Record<string, string | number | null>[] {
  return Array.isArray(valeur) ? valeur : [];
}

/** Valeur plausible reçue par postMessage : on ne fait confiance à aucun type. */
export function valeurContenuValide(v: unknown): v is ValeurContenu {
  if (v === null || typeof v === "string" || typeof v === "number") return true;
  if (!Array.isArray(v)) return false;
  return v.every(
    (el) =>
      typeof el === "object" &&
      el !== null &&
      !Array.isArray(el) &&
      Object.values(el).every((x) => x === null || typeof x === "string" || typeof x === "number"),
  );
}
