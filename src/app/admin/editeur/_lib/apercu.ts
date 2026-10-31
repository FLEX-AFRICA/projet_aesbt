import type { ChampEditeur, MediaEditeur, ValeurContenu } from "./types";

/**
 * Conversion d'une valeur d'édition en valeur d'aperçu.
 *
 * L'état d'édition conserve l'IDENTIFIANT du média (c'est ce que le backend
 * enregistre) ; l'iframe, elle, ne sait afficher qu'un chemin `/...` ou une
 * URL http(s). On remplace donc chaque identifiant par l'URL du dérivé de la
 * médiathèque ; un identifiant non résolvable donne null (rendu de repli).
 *
 * Exemples : image "abc123" avec média connu => "https://m/x-md.webp" ;
 * image "/images/p.webp" => inchangée ; image inconnue => null.
 */

export function urlApercuMedia(
  valeur: ValeurContenu | undefined,
  medias: readonly MediaEditeur[],
): string | null {
  if (typeof valeur !== "string") return null;
  if (valeur.startsWith("/") && !valeur.startsWith("//")) return valeur;
  if (/^https?:\/\//i.test(valeur)) return valeur;
  const media = medias.find((m) => m.id === valeur);
  return media?.apercu ?? media?.vignette ?? null;
}

export function valeurApercu(
  champ: ChampEditeur,
  valeur: ValeurContenu,
  medias: readonly MediaEditeur[],
): ValeurContenu {
  if (champ.type === "image") return urlApercuMedia(valeur, medias);
  if (champ.type === "liste" && Array.isArray(valeur)) {
    const images = (champ.sousChamps ?? []).filter((s) => s.type === "image").map((s) => s.nom);
    if (images.length === 0) return valeur;
    return valeur.map((el) => {
      const copie = { ...el };
      for (const nom of images) copie[nom] = urlApercuMedia(el[nom], medias);
      return copie;
    });
  }
  return valeur;
}
