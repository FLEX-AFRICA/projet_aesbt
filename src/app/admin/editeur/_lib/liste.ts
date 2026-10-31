import type { SousChamp } from "./types";

/**
 * Opérations pures sur les éléments d'une liste répétable.
 *
 * Exemples : deplacer([a, b, c], 0, 1) => [b, a, c] ;
 * deplacer([a, b], 0, -1) => [a, b] (hors bornes : inchangé) ;
 * elementVide([{nom: "titre", type: "texte"}, {nom: "n", type: "nombre"}])
 * => { titre: "", n: 0 }.
 */

export type ElementListe = Record<string, string | number | null>;

export function elementVide(sousChamps: readonly SousChamp[]): ElementListe {
  const element: ElementListe = {};
  for (const sous of sousChamps) {
    element[sous.nom] = sous.type === "nombre" ? 0 : sous.type === "image" ? null : "";
  }
  return element;
}

export function ajouter(liste: readonly ElementListe[], element: ElementListe): ElementListe[] {
  return [...liste, element];
}

export function supprimer(liste: readonly ElementListe[], index: number): ElementListe[] {
  return liste.filter((_, i) => i !== index);
}

/** Déplace l'élément `index` de `delta` rangs (-1 vers le haut, +1 vers le bas). */
export function deplacer(
  liste: readonly ElementListe[],
  index: number,
  delta: number,
): ElementListe[] {
  const cible = index + delta;
  if (index < 0 || index >= liste.length || cible < 0 || cible >= liste.length) {
    return [...liste];
  }
  const copie = [...liste];
  const [element] = copie.splice(index, 1);
  if (element) copie.splice(cible, 0, element);
  return copie;
}

export function modifierSousChamp(
  liste: readonly ElementListe[],
  index: number,
  nom: string,
  valeur: string | number | null,
): ElementListe[] {
  return liste.map((el, i) => (i === index ? { ...el, [nom]: valeur } : el));
}
