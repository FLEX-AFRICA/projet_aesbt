import { valeursEgales } from "./etat-edition";
import type { ElementListe } from "./liste";
import type { SousChamp, TypeChampEditeur, ValeurContenu } from "./types";

/**
 * Calcul des différences « avant / après » : fonctions pures, sans React.
 * Testé par `diff.test.ts` (vitest).
 *
 * diffMots(avant, apres) :
 * - identiques : un seul segment "egal" ;
 * - "bonjour le monde" / "bonjour tout le monde" : "bonjour ", ajout "tout ",
 *   "le monde" ;
 * - avant vide : un seul segment "ajout" ; apres vide : un seul "suppr" ;
 * - la concaténation des segments "egal" + "suppr" redonne `avant`, celle des
 *   segments "egal" + "ajout" redonne `apres` (invariant vérifié par les tests) ;
 * - textes très longs (plus de TAILLE_MAX_LCS cases de table) : repli sur un
 *   remplacement complet (un "suppr" puis un "ajout").
 *
 * diffListe(avant, apres) :
 * - [] / [a] : une entrée "ajoute" ; [a] / [] : une entrée "supprime" ;
 * - [a, b] / [b, a] : deux entrées "inchange", `ordreChange` vrai ;
 * - [a, b] / [a, b'] : "inchange" a, "modifie" b vers b' avec `champs` listant
 *   les sous-champs différents ;
 * - [a, b, c] / [a, c] : "supprime" b (les non-appariés sont associés dans
 *   l'ordre : le i-ème non apparié de `avant` avec le i-ème de `apres`) ;
 * - listes identiques : `identique` vrai et aucune entrée autre que "inchange".
 *
 * calculerChangements(champs) :
 * - champ sans brouillon : ignoré ;
 * - jamais publié (source "defaut") : `avant` = valeur par défaut ;
 * - brouillon égal à l'avant : `identique` vrai (publiable, mais sans effet) ;
 * - résultat dans l'ordre des champs reçus.
 */

// --- Mots ----------------------------------------------------------------

export interface SegmentMot {
  type: "egal" | "ajout" | "suppr";
  texte: string;
}

/** Au-delà, la table de plus longue sous-suite commune coûte trop cher. */
const TAILLE_MAX_LCS = 400_000;

/** Découpe en mots, chaque mot gardant l'espace qui le suit. */
function jetons(texte: string): string[] {
  return texte.match(/\S+\s*|\s+/g) ?? [];
}

function fusionner(segments: SegmentMot[]): SegmentMot[] {
  const resultat: SegmentMot[] = [];
  for (const s of segments) {
    const dernier = resultat[resultat.length - 1];
    if (dernier && dernier.type === s.type) dernier.texte += s.texte;
    else resultat.push({ ...s });
  }
  return resultat;
}

export function diffMots(avant: string, apres: string): SegmentMot[] {
  if (avant === apres) return avant === "" ? [] : [{ type: "egal", texte: avant }];
  const a = jetons(avant);
  const b = jetons(apres);
  if (a.length === 0) return [{ type: "ajout", texte: apres }];
  if (b.length === 0) return [{ type: "suppr", texte: avant }];
  if (a.length * b.length > TAILLE_MAX_LCS) {
    return [
      { type: "suppr", texte: avant },
      { type: "ajout", texte: apres },
    ];
  }

  // Plus longue sous-suite commune par programmation dynamique (de la fin).
  const n = a.length;
  const m = b.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const ligne = table[i];
      const suivante = table[i + 1];
      if (!ligne || !suivante) continue;
      ligne[j] =
        a[i] === b[j] ? (suivante[j + 1] ?? 0) + 1 : Math.max(suivante[j] ?? 0, ligne[j + 1] ?? 0);
    }
  }

  const segments: SegmentMot[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      segments.push({ type: "egal", texte: a[i] ?? "" });
      i++;
      j++;
    } else if ((table[i + 1]?.[j] ?? 0) >= (table[i]?.[j + 1] ?? 0)) {
      segments.push({ type: "suppr", texte: a[i] ?? "" });
      i++;
    } else {
      segments.push({ type: "ajout", texte: b[j] ?? "" });
      j++;
    }
  }
  while (i < n) segments.push({ type: "suppr", texte: a[i++] ?? "" });
  while (j < m) segments.push({ type: "ajout", texte: b[j++] ?? "" });
  return fusionner(segments);
}

// --- Listes --------------------------------------------------------------

export interface EntreeListe {
  statut: "inchange" | "ajoute" | "supprime" | "modifie";
  /** Élément après (ou avant pour un supprimé). */
  element: ElementListe;
  /** Élément avant, pour un élément modifié. */
  ancien?: ElementListe;
  /** Sous-champs différents, pour un élément modifié. */
  champs?: string[];
}

export interface DiffListe {
  entrees: EntreeListe[];
  ajoutes: number;
  supprimes: number;
  modifies: number;
  ordreChange: boolean;
  identique: boolean;
}

function cleElement(el: ElementListe): string {
  return JSON.stringify(
    Object.keys(el)
      .sort()
      .map((k) => [k, el[k]]),
  );
}

function champsDifferents(a: ElementListe, b: ElementListe): string[] {
  const noms = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...noms].filter((nom) => a[nom] !== b[nom]);
}

export function diffListe(
  avant: readonly ElementListe[],
  apres: readonly ElementListe[],
): DiffListe {
  const utilisesAvant = new Set<number>();
  /** Pour chaque élément d'après : indice apparié dans avant (égalité exacte), ou -1. */
  const appariements: number[] = apres.map((el) => {
    const cle = cleElement(el);
    const idx = avant.findIndex((x, i) => !utilisesAvant.has(i) && cleElement(x) === cle);
    if (idx >= 0) utilisesAvant.add(idx);
    return idx;
  });

  // Les non-appariés sont associés dans l'ordre : modification probable.
  const libresAvant = avant.map((_, i) => i).filter((i) => !utilisesAvant.has(i));
  let prochain = 0;
  const entrees: EntreeListe[] = [];
  let modifies = 0;
  let ajoutes = 0;
  apres.forEach((el, k) => {
    const idx = appariements[k] ?? -1;
    if (idx >= 0) {
      entrees.push({ statut: "inchange", element: el });
      return;
    }
    const ancienIdx = libresAvant[prochain++];
    const ancien = ancienIdx === undefined ? undefined : avant[ancienIdx];
    if (ancien) {
      modifies++;
      entrees.push({
        statut: "modifie",
        element: el,
        ancien,
        champs: champsDifferents(ancien, el),
      });
    } else {
      ajoutes++;
      entrees.push({ statut: "ajoute", element: el });
    }
  });
  const restants = libresAvant.slice(prochain);
  for (const idx of restants) {
    const el = avant[idx];
    if (el) entrees.push({ statut: "supprime", element: el });
  }

  // Ordre : les indices d'`avant` des éléments conservés doivent croître.
  const conserves = appariements.filter((i) => i >= 0);
  const ordreChange = conserves.some((v, i) => i > 0 && v < (conserves[i - 1] ?? -1));

  const supprimes = restants.length;
  return {
    entrees,
    ajoutes,
    supprimes,
    modifies,
    ordreChange,
    identique: ajoutes === 0 && supprimes === 0 && modifies === 0 && !ordreChange,
  };
}

// --- Changements par clé ---------------------------------------------------

/** Champ tel que le diff le consomme (publié, défaut et brouillon). */
export interface ChampPourDiff {
  cle: string;
  type: TypeChampEditeur;
  libelle: string;
  groupe: string;
  sousChamps: SousChamp[] | null;
  valeur: ValeurContenu;
  defaut: ValeurContenu;
  source: "defaut" | "publie";
  /** Brouillon enregistré, ou undefined s'il n'y en a pas. */
  brouillon: ValeurContenu | undefined;
}

export interface ChangementCle {
  cle: string;
  type: TypeChampEditeur;
  libelle: string;
  groupe: string;
  sousChamps: SousChamp[] | null;
  avant: ValeurContenu;
  apres: ValeurContenu;
  identique: boolean;
}

export function calculerChangements(champs: readonly ChampPourDiff[]): ChangementCle[] {
  const resultat: ChangementCle[] = [];
  for (const champ of champs) {
    if (champ.brouillon === undefined) continue;
    const avant = champ.source === "publie" ? champ.valeur : champ.defaut;
    resultat.push({
      cle: champ.cle,
      type: champ.type,
      libelle: champ.libelle,
      groupe: champ.groupe,
      sousChamps: champ.sousChamps,
      avant,
      apres: champ.brouillon,
      identique: valeursEgales(avant, champ.brouillon),
    });
  }
  return resultat;
}
