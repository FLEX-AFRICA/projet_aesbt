import type { ChampEditeur, SousChamp, TypeScalaire, ValeurContenu, Valeurs } from "./types";

/**
 * Validation côté client, alignée sur le backend
 * (backend_aesbt/src/contenus/registre.ts, `schemaChamp`). Le backend reste
 * l'autorité : ces règles évitent seulement un aller-retour inutile.
 *
 * Règles reprises :
 * - texte : rogné, 1 à `max` caractères (200 par défaut), ni `<` ni `>`, ni
 *   caractère de contrôle ;
 * - texte long : idem (5000 par défaut), saut de ligne autorisé ;
 * - lien : `http(s)://...` ou chemin interne `/...` (jamais `//hote`, `\`, `..`,
 *   espace), 2000 caractères au plus ;
 * - image : null (aucune image), chemin public `/...` ou identifiant de média ;
 * - nombre : fini, borné par `minValeur` et `maxValeur` ;
 * - liste : au plus `max` éléments (50 par défaut), chaque sous-champ validé.
 *
 * Les erreurs sont un dictionnaire : clé "" pour le champ lui-même, clé
 * `"<index>.<nom>"` pour un sous-champ d'élément de liste.
 *
 * Exemples : validerChamp(texteMax5, "abcdef") => {"": "Au plus 5 caractères."} ;
 * validerChamp(texte, "<b>") => {"": "Texte brut uniquement ..."} ;
 * validerChamp(lien, "javascript:alert(1)") => {"": "Lien invalide ..."}.
 */

export type ErreursChamp = Record<string, string>;

const CHEMIN_PUBLIC = /^\/[A-Za-z0-9._\-/]+$/;
const ID_MEDIA = /^[A-Za-z0-9_-]{6,64}$/;

function contientInterdit(v: string, long: boolean): boolean {
  for (let i = 0; i < v.length; i++) {
    const c = v.charCodeAt(i);
    if (v[i] === "<" || v[i] === ">" || c === 0x7f) return true;
    if (c < 0x20 && !(long && (c === 0x0a || c === 0x0d))) return true;
  }
  return false;
}

function texteValide(v: ValeurContenu | undefined, max: number, long: boolean): string | null {
  if (typeof v !== "string") return "Valeur vide.";
  const t = v.trim();
  if (t === "") return "Valeur vide.";
  if (t.length > max) return `Au plus ${max} caractères.`;
  if (contientInterdit(t, long))
    return "Texte brut uniquement : pas de HTML ni de caractère de contrôle.";
  return null;
}

export function lienValide(valeur: string): boolean {
  const v = valeur.trim();
  if (v === "" || contientInterdit(v, false) || /\s/.test(v)) return false;
  if (v.startsWith("/")) return !v.startsWith("//") && !v.includes("\\") && !v.includes("..");
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function erreurScalaire(
  type: TypeScalaire,
  max: number | null,
  bornes: { min: number | null; max: number | null },
  v: ValeurContenu | undefined,
): string | null {
  switch (type) {
    case "texte":
      return texteValide(v, max ?? 200, false);
    case "texte_long":
      return texteValide(v, max ?? 5000, true);
    case "lien": {
      if (typeof v !== "string" || v.trim() === "") return "Valeur vide.";
      if (v.trim().length > (max ?? 2000)) return `Au plus ${max ?? 2000} caractères.`;
      return lienValide(v) ? null : "Lien invalide : http(s) ou chemin interne attendu.";
    }
    case "image": {
      if (v === null) return null;
      if (typeof v !== "string") return "Image invalide.";
      const t = v.trim();
      const ok = t.startsWith("/")
        ? CHEMIN_PUBLIC.test(t) && !t.includes("..") && !t.startsWith("//")
        : ID_MEDIA.test(t);
      return ok ? null : "Image invalide : choisissez une image de la médiathèque.";
    }
    case "nombre": {
      if (typeof v !== "number" || !Number.isFinite(v)) return "Nombre attendu.";
      if (bornes.min !== null && v < bornes.min) return `Au moins ${bornes.min}.`;
      if (bornes.max !== null && v > bornes.max) return `Au plus ${bornes.max}.`;
      return null;
    }
  }
}

const SANS_BORNES = { min: null, max: null } as const;

/** Valide la valeur d'un champ. Dictionnaire vide : valide. */
export function validerChamp(champ: ChampEditeur, valeur: ValeurContenu | undefined): ErreursChamp {
  if (champ.type !== "liste") {
    const message = erreurScalaire(
      champ.type,
      champ.max,
      { min: champ.minValeur, max: champ.maxValeur },
      valeur,
    );
    return message ? { "": message } : {};
  }

  if (!Array.isArray(valeur)) return { "": "Liste attendue." };
  const erreurs: ErreursChamp = {};
  const max = champ.max ?? 50;
  if (valeur.length > max) erreurs[""] = `Au plus ${max} éléments.`;
  valeur.forEach((element, i) => {
    for (const sous of champ.sousChamps ?? []) {
      const message = erreurScalaire(sous.type, sous.max, SANS_BORNES, element[sous.nom]);
      if (message) erreurs[`${i}.${sous.nom}`] = message;
    }
  });
  return erreurs;
}

/** Valide tout un jeu de modifications. Seules les clés en erreur sont renvoyées. */
export function validerModifications(
  champs: readonly ChampEditeur[],
  modifs: Valeurs,
): Record<string, ErreursChamp> {
  const resultat: Record<string, ErreursChamp> = {};
  for (const champ of champs) {
    if (!(champ.cle in modifs)) continue;
    const erreurs = validerChamp(champ, modifs[champ.cle]);
    if (Object.keys(erreurs).length > 0) resultat[champ.cle] = erreurs;
  }
  return resultat;
}

/** Première erreur lisible d'un champ (pour un résumé). */
export function premiereErreur(erreurs: ErreursChamp): string | null {
  const [premiere] = Object.values(erreurs);
  return premiere ?? null;
}

function rogner(v: ValeurContenu | undefined, sous: Pick<SousChamp, "type">): ValeurContenu {
  if (v === undefined) return null;
  return typeof v === "string" && sous.type !== "image" ? v.trim() : v;
}

/** Valeur prête à l'envoi : textes rognés (le backend rogne aussi). */
export function normaliserPourEnvoi(champ: ChampEditeur, valeur: ValeurContenu): ValeurContenu {
  if (Array.isArray(valeur)) {
    return valeur.map((el) => {
      const copie: Record<string, string | number | null> = {};
      for (const sous of champ.sousChamps ?? []) {
        const v = rogner(el[sous.nom], sous);
        copie[sous.nom] = Array.isArray(v) ? null : v;
      }
      return copie;
    });
  }
  return rogner(valeur, { type: champ.type === "liste" ? "texte" : champ.type });
}
