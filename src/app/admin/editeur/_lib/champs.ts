import { valeurContenuValide } from "@/components/editable/contenu";

import type {
  ChampEditeur,
  SousChamp,
  TypeChampEditeur,
  TypeScalaire,
  ValeurContenu,
} from "./types";

/**
 * Normalisation de la réponse de GET /api/v1/admin/contenus/:page.
 *
 * Fonctions pures, sans dépendance à React. Tolérance : les métadonnées
 * `groupe`, `ordre`, `min_valeur`, `max_valeur` sont facultatives, un type
 * inconnu retombe sur `texte`, un libellé absent est déduit de la clé.
 *
 * Exemples (couverts par `champs.test.ts`) :
 * - libelleDepuisCle("association.hero.titre") === "Hero titre"
 * - libelleDepuisCle("association.missions") === "Missions"
 * - groupeDepuisCle("association.hero.titre") === "Hero"
 * - groupeDepuisCle("association.missions") === "Général"
 */

const TYPES: readonly TypeChampEditeur[] = [
  "texte",
  "texte_long",
  "lien",
  "image",
  "nombre",
  "liste",
];
const TYPES_SCALAIRES: readonly TypeScalaire[] = ["texte", "texte_long", "lien", "image", "nombre"];

function majuscule(s: string): string {
  const propre = s.replace(/[_-]+/g, " ").trim();
  return propre === "" ? propre : propre.charAt(0).toUpperCase() + propre.slice(1);
}

/** Libellé lisible déduit d'une clé `page.section.champ` (sans le nom de page). */
export function libelleDepuisCle(cle: string): string {
  const morceaux = cle.split(".").slice(1);
  if (morceaux.length === 0) return majuscule(cle);
  return majuscule(morceaux.slice(-2).join(" "));
}

/** Groupe déduit de la clé : la section (2e segment) si la clé en a trois. */
export function groupeDepuisCle(cle: string): string {
  const morceaux = cle.split(".");
  return morceaux.length >= 3 ? majuscule(morceaux[1] ?? "") : "Général";
}

/** Forme tolérante d'un objet reçu de l'API : toute propriété est inconnue. */
interface Brut {
  cle?: unknown;
  type?: unknown;
  libelle?: unknown;
  groupe?: unknown;
  ordre?: unknown;
  max?: unknown;
  min_valeur?: unknown;
  max_valeur?: unknown;
  champs?: unknown;
  nom?: unknown;
  version?: unknown;
  valeur?: unknown;
  brouillon?: unknown;
}

function enregistrement(v: unknown): Brut | null {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Brut) : null;
}

function nombreOuNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function typeScalaire(v: unknown): TypeScalaire {
  return TYPES_SCALAIRES.find((t) => t === v) ?? "texte";
}

/** Sous-champs déclarés par l'API, ou null si absents ou inexploitables. */
function sousChampsDeclares(brut: unknown): SousChamp[] | null {
  if (!Array.isArray(brut)) return null;
  const resultat: SousChamp[] = [];
  for (const el of brut) {
    const o = enregistrement(el);
    if (!o || typeof o.nom !== "string" || o.nom === "") continue;
    resultat.push({
      nom: o.nom,
      type: typeScalaire(o.type),
      libelle: typeof o.libelle === "string" && o.libelle !== "" ? o.libelle : majuscule(o.nom),
      max: nombreOuNull(o.max),
    });
  }
  return resultat.length > 0 ? resultat : null;
}

/**
 * Déduit les sous-champs d'une liste de la forme des éléments actuels.
 * Nombre pour un nombre, lien pour `lien`/`url`/`href`, image pour
 * `image`/`photo`/`media`, texte long pour un texte long ou multiligne.
 */
export function deduireSousChamps(elements: readonly Record<string, unknown>[]): SousChamp[] {
  const vus = new Map<string, SousChamp>();
  for (const element of elements) {
    for (const [nom, v] of Object.entries(element)) {
      if (vus.has(nom)) continue;
      let type: TypeScalaire = "texte";
      if (typeof v === "number") type = "nombre";
      else if (/^(lien|url|href)/i.test(nom)) type = "lien";
      else if (/^(image|photo|media)/i.test(nom)) type = "image";
      else if (typeof v === "string" && (v.length > 80 || v.includes("\n"))) type = "texte_long";
      vus.set(nom, { nom, type, libelle: majuscule(nom), max: null });
    }
  }
  return [...vus.values()];
}

/**
 * Lit la réponse de l'API. Renvoie null si la forme générale est invalide
 * (pas de tableau `champs`), sinon les champs triés par groupe puis ordre.
 */
export function lireChamps(reponse: unknown): ChampEditeur[] | null {
  const racine = enregistrement(reponse);
  if (!racine || !Array.isArray(racine.champs)) return null;

  const champs: ChampEditeur[] = [];
  racine.champs.forEach((brut: unknown, index: number) => {
    const o = enregistrement(brut);
    if (!o || typeof o.cle !== "string" || o.cle === "") return;

    const type = TYPES.find((t) => t === o.type) ?? "texte";
    const valeurBrouillon = o.brouillon;
    const base: ValeurContenu =
      valeurBrouillon !== null &&
      valeurBrouillon !== undefined &&
      valeurContenuValide(valeurBrouillon)
        ? valeurBrouillon
        : valeurContenuValide(o.valeur)
          ? o.valeur
          : null;

    let sousChamps: SousChamp[] | null = null;
    if (type === "liste") {
      sousChamps =
        sousChampsDeclares(o.champs) ??
        (Array.isArray(base) && base.length > 0 ? deduireSousChamps(base) : null);
    }

    champs.push({
      cle: o.cle,
      type,
      libelle:
        typeof o.libelle === "string" && o.libelle !== "" ? o.libelle : libelleDepuisCle(o.cle),
      groupe: typeof o.groupe === "string" && o.groupe !== "" ? o.groupe : groupeDepuisCle(o.cle),
      ordre: nombreOuNull(o.ordre) ?? index,
      max: nombreOuNull(o.max),
      minValeur: nombreOuNull(o.min_valeur),
      maxValeur: nombreOuNull(o.max_valeur),
      sousChamps,
      version: nombreOuNull(o.version) ?? 0,
      base,
    });
  });

  return champs.sort((a, b) => a.ordre - b.ordre);
}

/** Regroupe les champs par groupe, en conservant l'ordre de première apparition. */
export function grouperChamps(
  champs: readonly ChampEditeur[],
): { groupe: string; champs: ChampEditeur[] }[] {
  const groupes = new Map<string, ChampEditeur[]>();
  for (const champ of champs) {
    const liste = groupes.get(champ.groupe) ?? [];
    liste.push(champ);
    groupes.set(champ.groupe, liste);
  }
  return [...groupes.entries()].map(([groupe, liste]) => ({ groupe, champs: liste }));
}
