import type { Valeurs, ValeurContenu } from "./types";

/**
 * État d'édition : jeu de modifications en mémoire avec annuler/rétablir.
 *
 * Fonctions pures (réducteur) : aucune dépendance à React. Cas couverts par
 * `etat-edition.test.ts` :
 * - modifier puis remettre la valeur de base : la clé disparaît de `modifs` ;
 * - deux frappes sur la même clé en moins de DELAI_FUSION_MS : un seul pas
 *   d'historique ; une autre clé ou un délai plus long : un nouveau pas ;
 * - annuler puis rétablir restitue exactement le jeu précédent ;
 * - une modification après un annuler vide la pile « rétablir » ;
 * - `reinitialiser` (après publication, rejet ou restauration) remplace la
 *   base par l'état serveur rechargé, vide l'historique et ne garde que les
 *   modifications locales qui diffèrent encore de la nouvelle base ;
 * - `enregistre` met à jour la base, retire les clés enregistrées dont la
 *   valeur n'a pas changé entre-temps, et vide l'historique.
 */

/** Frappes rapprochées sur un même champ : fusionnées en un pas d'historique. */
export const DELAI_FUSION_MS = 1000;
const TAILLE_MAX_HISTORIQUE = 200;

export interface EtatEdition {
  /** Valeurs connues du serveur (brouillon ou effectives). */
  base: Valeurs;
  /** Écarts par rapport à la base : seules les clés modifiées. */
  modifs: Valeurs;
  passe: Valeurs[];
  futur: Valeurs[];
  derniere: { cle: string; t: number } | null;
}

export type ActionEdition =
  | { type: "modifier"; cle: string; valeur: ValeurContenu; t: number }
  | { type: "annuler" }
  | { type: "retablir" }
  /** `envoyees` : valeurs normalisées envoyées ; `originales` : celles de l'état avant envoi. */
  | { type: "enregistre"; envoyees: Valeurs; originales: Valeurs }
  /** Nouvel état serveur : remplace la base (publication, rejet, restauration). */
  | { type: "reinitialiser"; base: Valeurs };

export function etatInitial(base: Valeurs): EtatEdition {
  return { base, modifs: {}, passe: [], futur: [], derniere: null };
}

/** Égalité profonde des valeurs de contenu (texte, nombre, null, liste d'objets plats). */
export function valeursEgales(a: ValeurContenu | undefined, b: ValeurContenu | undefined): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((el, i) => {
      const autre = b[i];
      if (!autre) return false;
      const cles = new Set([...Object.keys(el), ...Object.keys(autre)]);
      return [...cles].every((k) => el[k] === autre[k]);
    });
  }
  return false;
}

export function reduire(etat: EtatEdition, action: ActionEdition): EtatEdition {
  switch (action.type) {
    case "modifier": {
      const modifs = { ...etat.modifs };
      if (valeursEgales(action.valeur, etat.base[action.cle])) delete modifs[action.cle];
      else modifs[action.cle] = action.valeur;

      // Aucun changement réel : on garde l'état (pas de pas d'historique vide).
      const presenteAvant = action.cle in etat.modifs;
      const presenteApres = action.cle in modifs;
      if (
        presenteAvant === presenteApres &&
        valeursEgales(modifs[action.cle], etat.modifs[action.cle])
      ) {
        return etat;
      }

      const fusion =
        etat.derniere !== null &&
        etat.derniere.cle === action.cle &&
        action.t - etat.derniere.t < DELAI_FUSION_MS &&
        etat.passe.length > 0;
      const passe = fusion
        ? etat.passe
        : [...etat.passe, etat.modifs].slice(-TAILLE_MAX_HISTORIQUE);
      return { ...etat, modifs, passe, futur: [], derniere: { cle: action.cle, t: action.t } };
    }
    case "annuler": {
      const precedent = etat.passe[etat.passe.length - 1];
      if (!precedent) return etat;
      return {
        ...etat,
        modifs: precedent,
        passe: etat.passe.slice(0, -1),
        futur: [...etat.futur, etat.modifs],
        derniere: null,
      };
    }
    case "retablir": {
      const suivant = etat.futur[etat.futur.length - 1];
      if (!suivant) return etat;
      return {
        ...etat,
        modifs: suivant,
        passe: [...etat.passe, etat.modifs],
        futur: etat.futur.slice(0, -1),
        derniere: null,
      };
    }
    case "reinitialiser": {
      const modifs: Valeurs = {};
      for (const [cle, valeur] of Object.entries(etat.modifs)) {
        if (!valeursEgales(valeur, action.base[cle])) modifs[cle] = valeur;
      }
      return { base: action.base, modifs, passe: [], futur: [], derniere: null };
    }
    case "enregistre": {
      const modifs = { ...etat.modifs };
      for (const cle of Object.keys(action.envoyees)) {
        if (valeursEgales(modifs[cle], action.originales[cle])) delete modifs[cle];
      }
      return {
        base: { ...etat.base, ...action.envoyees },
        modifs,
        passe: [],
        futur: [],
        derniere: null,
      };
    }
  }
}

export function nombreModifications(etat: EtatEdition): number {
  return Object.keys(etat.modifs).length;
}

/**
 * Valeurs à envoyer à l'aperçu pour passer de `avant` à `apres`.
 * Une clé retirée du jeu de modifications revient à sa valeur de base.
 * Exemple : avant {a: "x"}, apres {}, base {a: "o"} => [{cle: "a", valeur: "o"}].
 */
export function changementsApercu(
  avant: Valeurs,
  apres: Valeurs,
  base: Valeurs,
): { cle: string; valeur: ValeurContenu }[] {
  const resultat: { cle: string; valeur: ValeurContenu }[] = [];
  for (const cle of new Set([...Object.keys(avant), ...Object.keys(apres)])) {
    if (valeursEgales(avant[cle], apres[cle])) continue;
    const valeur = cle in apres ? apres[cle] : base[cle];
    if (valeur !== undefined) resultat.push({ cle, valeur });
  }
  return resultat;
}
