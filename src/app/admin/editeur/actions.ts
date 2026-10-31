"use server";

import { ApiErreur, appelApi, peutEditerContenus, sessionCourante } from "@/lib/api-admin";

import type { ValeurContenu } from "./_lib/types";

/**
 * Actions de l'éditeur visuel. L'API reste l'autorité (rôle, validation,
 * versions) : ici on relaie le cookie de session et on traduit les réponses.
 */

export interface ConflitChamp {
  cle: string;
  versionCourante: number;
}

export type ResultatBrouillon =
  | { statut: "ok"; versions: Record<string, number> }
  /** 409 : au moins un champ a été modifié par quelqu'un d'autre. */
  | { statut: "conflit"; conflits: ConflitChamp[] }
  /** 400 ou 422 : erreurs par clé (message global sous la clé ""). */
  | { statut: "invalide"; erreurs: Record<string, string>; message: string }
  | { statut: "erreur"; message: string };

const PAGE_VALIDE = /^[a-z0-9_-]{1,60}$/;

/** Corps d'erreur de l'API, lu de façon tolérante. */
interface CorpsErreur {
  conflits?: unknown;
  details?: unknown;
  cles?: unknown;
  medias?: unknown;
  cle?: unknown;
  version_courante?: unknown;
  message?: unknown;
}

function enregistrement(v: unknown): CorpsErreur | null {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as CorpsErreur) : null;
}

/** Lit `conflits: [{cle, version_courante}]` du corps d'un 409. */
function lireConflits(corps: CorpsErreur, cles: string[]): ConflitChamp[] {
  const brut = Array.isArray(corps.conflits) ? corps.conflits : [];
  const lus: ConflitChamp[] = [];
  for (const c of brut) {
    const o = enregistrement(c);
    if (o && typeof o.cle === "string" && typeof o.version_courante === "number") {
      lus.push({ cle: o.cle, versionCourante: o.version_courante });
    }
  }
  // Corps inattendu : on signale toutes les clés (versionCourante inconnue : -1).
  return lus.length > 0 ? lus : cles.map((cle) => ({ cle, versionCourante: -1 }));
}

/** Lit `details: [{cle, message}]` d'un 422, ou `cles` d'un 400. */
function lireErreurs(corps: CorpsErreur): Record<string, string> {
  const erreurs: Record<string, string> = {};
  if (Array.isArray(corps.details)) {
    for (const d of corps.details) {
      const o = enregistrement(d);
      if (o && typeof o.cle === "string" && typeof o.message === "string") {
        erreurs[o.cle] = o.message;
      }
    }
  }
  if (Array.isArray(corps.cles)) {
    for (const cle of corps.cles) {
      if (typeof cle === "string") erreurs[cle] = "Champ refusé par le serveur.";
    }
  }
  if (Array.isArray(corps.medias)) {
    erreurs[""] = "Une image choisie n'existe plus dans la médiathèque.";
  }
  return erreurs;
}

/**
 * Enregistre un jeu de modifications en brouillon.
 * `versions` : version lue par clé modifiée (0 si jamais écrite).
 */
export async function enregistrerBrouillon(
  page: string,
  modifications: Record<string, ValeurContenu>,
  versions: Record<string, number>,
): Promise<ResultatBrouillon> {
  if (!PAGE_VALIDE.test(page)) return { statut: "erreur", message: "Page inconnue." };
  const cles = Object.keys(modifications);
  if (cles.length === 0) return { statut: "erreur", message: "Aucune modification à enregistrer." };

  const session = await sessionCourante();
  if (!peutEditerContenus(session)) {
    return { statut: "erreur", message: "Votre session a expiré ou vos droits sont insuffisants." };
  }

  try {
    const reponse = await appelApi<{ versions?: Record<string, number> }>(
      `/api/v1/admin/contenus/${page}/brouillon`,
      { methode: "PUT", corps: { modifications, versions } },
    );
    return { statut: "ok", versions: reponse.versions ?? {} };
  } catch (err) {
    if (err instanceof ApiErreur) {
      if (err.statut === 409) {
        return { statut: "conflit", conflits: lireConflits(err.corps, cles) };
      }
      if (err.statut === 400 || err.statut === 422) {
        const erreurs = lireErreurs(err.corps);
        return {
          statut: "invalide",
          erreurs,
          message: "Le serveur a refusé certaines valeurs. Corrigez-les puis réessayez.",
        };
      }
      if (err.statut === 401 || err.statut === 403) {
        return {
          statut: "erreur",
          message: "Votre session a expiré ou vos droits sont insuffisants.",
        };
      }
    }
    return {
      statut: "erreur",
      message: "Enregistrement impossible : le serveur est injoignable. Réessayez.",
    };
  }
}
