import { valeurContenuValide } from "@/components/editable/contenu";

import type { ChampPourDiff } from "./diff";
import { lireChamps } from "./champs";
import type { ChampEditeur, ValeurContenu } from "./types";

/**
 * Lecture tolérante des réponses du workflow (détail de page avec publié,
 * défaut et brouillon ; soumissions ; historique). Fonctions pures.
 *
 * Cas couverts par `detail.test.ts` :
 * - `brouillon: null` : le champ n'a pas de brouillon (`brouillon` undefined) ;
 * - `source` absent ou inconnu : traité comme "defaut" ;
 * - valeur illisible (objet, tableau de tableaux) : remplacée par null ;
 * - média absent de la table `medias` : simplement absent du résultat ;
 * - soumission sans `soumis_le` ou sans `page` : ignorée ;
 * - note vide ou non textuelle : null.
 */

export interface MediaReference {
  chemin: string;
  alt: string;
}

export interface DetailServeur {
  champs: ChampPourDiff[];
  medias: Record<string, MediaReference>;
}

export interface Soumission {
  page: string;
  soumisParNom: string | null;
  soumisLe: string;
  note: string | null;
}

export interface VersionHistorique {
  id: number;
  cle: string;
  version: number;
  acteurNom: string | null;
  creeLe: string;
  avant: ValeurContenu;
  apres: ValeurContenu;
}

/** Objet JSON lu de façon tolérante : toutes les clés lues sont `unknown`. */
interface Brut {
  champs?: unknown;
  medias?: unknown;
  cle?: unknown;
  valeur?: unknown;
  defaut?: unknown;
  source?: unknown;
  brouillon?: unknown;
  chemin?: unknown;
  alt?: unknown;
  page?: unknown;
  soumis_le?: unknown;
  soumis_par_nom?: unknown;
  note?: unknown;
  soumissions?: unknown;
  soumission?: unknown;
  pages?: unknown;
  cles_brouillon?: unknown;
  versions?: unknown;
  id?: unknown;
  version?: unknown;
  created_at?: unknown;
  acteur_nom?: unknown;
  valeur_avant?: unknown;
  valeur_apres?: unknown;
}

function enregistrement(v: unknown): Brut | null {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Brut) : null;
}

function valeurLue(v: unknown): ValeurContenu {
  return valeurContenuValide(v) ? v : null;
}

/** Détail de page : brouillon, publié et défaut par clé, plus la table des médias. */
export function lireDetail(
  reponse: unknown,
  champsEditeur: readonly ChampEditeur[],
): DetailServeur | null {
  const racine = enregistrement(reponse);
  if (!racine || !Array.isArray(racine.champs)) return null;
  const meta = new Map(champsEditeur.map((c) => [c.cle, c]));

  const champs: ChampPourDiff[] = [];
  for (const brut of racine.champs) {
    const o = enregistrement(brut);
    const cle = o?.cle;
    if (!o || typeof cle !== "string") continue;
    const m = meta.get(cle);
    if (!m) continue;
    champs.push({
      cle,
      type: m.type,
      libelle: m.libelle,
      groupe: m.groupe,
      sousChamps: m.sousChamps,
      valeur: valeurLue(o.valeur),
      defaut: valeurLue(o.defaut),
      source: o.source === "publie" ? "publie" : "defaut",
      brouillon:
        o.brouillon === null || o.brouillon === undefined ? undefined : valeurLue(o.brouillon),
    });
  }

  const medias: Record<string, MediaReference> = {};
  const table = enregistrement(racine.medias);
  if (table) {
    for (const [id, brut] of Object.entries(table)) {
      const o = enregistrement(brut);
      if (o && typeof o.chemin === "string") {
        medias[id] = { chemin: o.chemin, alt: typeof o.alt === "string" ? o.alt : "" };
      }
    }
  }
  return { champs, medias };
}

/** Une soumission en attente (ligne de /soumissions ou `soumission` de /resume). */
export function lireSoumission(brut: unknown, pageParDefaut?: string): Soumission | null {
  const o = enregistrement(brut);
  if (!o) return null;
  const page = typeof o.page === "string" ? o.page : pageParDefaut;
  if (!page || typeof o.soumis_le !== "string") return null;
  return {
    page,
    soumisParNom: typeof o.soumis_par_nom === "string" ? o.soumis_par_nom : null,
    soumisLe: o.soumis_le,
    note: typeof o.note === "string" && o.note.trim() !== "" ? o.note : null,
  };
}

export function lireSoumissions(reponse: unknown): Soumission[] {
  const racine = enregistrement(reponse);
  if (!racine || !Array.isArray(racine.soumissions)) return [];
  return racine.soumissions.flatMap((s) => {
    const lue = lireSoumission(s);
    return lue ? [lue] : [];
  });
}

export interface ResumePage {
  page: string;
  clesBrouillon: number;
  soumission: Soumission | null;
}

export function lireResume(reponse: unknown): ResumePage[] | null {
  const racine = enregistrement(reponse);
  if (!racine || !Array.isArray(racine.pages)) return null;
  return racine.pages.flatMap((p) => {
    const o = enregistrement(p);
    if (!o || typeof o.page !== "string") return [];
    return [
      {
        page: o.page,
        clesBrouillon: typeof o.cles_brouillon === "number" ? o.cles_brouillon : 0,
        soumission: lireSoumission(o.soumission, o.page),
      },
    ];
  });
}

export function lireHistorique(reponse: unknown): VersionHistorique[] | null {
  const racine = enregistrement(reponse);
  if (!racine || !Array.isArray(racine.versions)) return null;
  return racine.versions.flatMap((v) => {
    const o = enregistrement(v);
    if (
      !o ||
      typeof o.id !== "number" ||
      typeof o.cle !== "string" ||
      typeof o.version !== "number" ||
      typeof o.created_at !== "string"
    ) {
      return [];
    }
    return [
      {
        id: o.id,
        cle: o.cle,
        version: o.version,
        acteurNom: typeof o.acteur_nom === "string" ? o.acteur_nom : null,
        creeLe: o.created_at,
        avant: valeurLue(o.valeur_avant),
        apres: valeurLue(o.valeur_apres),
      },
    ];
  });
}
