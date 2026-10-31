"use server";

import { ApiErreur, appelApi, sessionCourante, type SessionAdmin } from "@/lib/api-admin";

import { lireChamps } from "./_lib/champs";
import {
  lireDetail,
  lireHistorique,
  type DetailServeur,
  type Soumission,
  type VersionHistorique,
} from "./_lib/detail";
import { chargerSoumission } from "./_lib/serveur";
import type { ChampEditeur } from "./_lib/types";

/**
 * Actions serveur du workflow (publier, rejeter, soumettre, historique,
 * restaurer). L'API reste l'autorité sur les droits : le contrôle de rôle ici
 * évite seulement un appel inutile et donne un message clair.
 */

export type CodeErreur =
  "droits" | "conflit" | "invalide" | "aucun_brouillon" | "introuvable" | "reseau";

export type ResultatOp<T extends object = object> =
  ({ statut: "ok" } & T) | { statut: "erreur"; code: CodeErreur; message: string };

export interface EtatCharge {
  champs: ChampEditeur[];
  detail: DetailServeur;
  soumission: Soumission | null;
}

const PAGE_VALIDE = /^[a-z0-9_-]{1,60}$/;

function erreur(
  code: CodeErreur,
  message: string,
): { statut: "erreur"; code: CodeErreur; message: string } {
  return { statut: "erreur", code, message };
}

function corpsDe(err: ApiErreur): {
  erreur?: unknown;
  message?: unknown;
  details?: unknown;
  medias?: unknown;
} {
  return err.corps as { erreur?: unknown; message?: unknown; details?: unknown; medias?: unknown };
}

/** Traduit une erreur de l'API en résultat lisible. */
function traduire(err: unknown, action: string) {
  if (err instanceof ApiErreur) {
    const corps = corpsDe(err);
    switch (err.statut) {
      case 401:
        return erreur("droits", "Votre session a expiré. Reconnectez-vous puis réessayez.");
      case 403:
        return erreur("droits", `Votre compte n'a pas le droit de ${action}.`);
      case 404:
        return erreur(
          "introuvable",
          corps.erreur === "version_introuvable"
            ? typeof corps.message === "string" && corps.message
              ? corps.message
              : "Cette version n'existe plus dans l'historique."
            : "Page ou contenu introuvable.",
        );
      case 409:
        if (corps.erreur === "aucun_brouillon") {
          return erreur(
            "aucun_brouillon",
            "Il n'y a aucun brouillon enregistré : modifiez d'abord un champ.",
          );
        }
        return erreur(
          "conflit",
          "Le contenu a été modifié par quelqu'un d'autre entre-temps. Relisez les modifications.",
        );
      case 400:
      case 422: {
        if (Array.isArray(corps.medias)) {
          return erreur("invalide", "Une image choisie n'existe plus dans la médiathèque.");
        }
        const premier: unknown = Array.isArray(corps.details) ? corps.details[0] : undefined;
        const msg =
          typeof premier === "object" && premier !== null && "message" in premier
            ? String((premier as { message: unknown }).message)
            : null;
        return erreur(
          "invalide",
          msg ? `Le serveur a refusé une valeur : ${msg}` : "Le serveur a refusé la demande.",
        );
      }
    }
  }
  return erreur("reseau", "Le serveur est injoignable. Réessayez dans un instant.");
}

async function exigerRole(admin: boolean): Promise<SessionAdmin | null> {
  const session = await sessionCourante();
  if (!session) return null;
  if (admin ? session.role !== "admin" : session.role !== "admin" && session.role !== "editeur") {
    return null;
  }
  return session;
}

const REFUS_ADMIN = erreur("droits", "Seul un administrateur peut effectuer cette action.");
const REFUS_SESSION = erreur("droits", "Votre session a expiré ou vos droits sont insuffisants.");

/** Recharge l'état serveur d'une page (champs, brouillons, soumission en attente). */
export async function chargerEtat(page: string): Promise<ResultatOp<EtatCharge>> {
  if (!PAGE_VALIDE.test(page)) return erreur("introuvable", "Page inconnue.");
  if (!(await exigerRole(false))) return REFUS_SESSION;
  try {
    const reponse = await appelApi<unknown>(`/api/v1/admin/contenus/${page}`);
    const champs = lireChamps(reponse);
    const detail = champs ? lireDetail(reponse, champs) : null;
    if (!champs || !detail) return erreur("reseau", "L'API a renvoyé des données illisibles.");

    // La soumission est secondaire : un échec du résumé ne bloque pas le rechargement.
    const soumission = await chargerSoumission(page);
    return { statut: "ok", champs, detail, soumission };
  } catch (err) {
    return traduire(err, "consulter cette page");
  }
}

/** Publie les clés choisies (administrateur). */
export async function publierCles(
  page: string,
  cles: string[],
): Promise<ResultatOp<{ publiees: string[] }>> {
  if (!PAGE_VALIDE.test(page) || cles.length === 0)
    return erreur("invalide", "Aucune clé à publier.");
  if (!(await exigerRole(true))) return REFUS_ADMIN;
  try {
    const r = await appelApi<{ publiees?: string[] }>(`/api/v1/admin/contenus/${page}/publier`, {
      methode: "POST",
      corps: { cles },
    });
    return { statut: "ok", publiees: r.publiees ?? [] };
  } catch (err) {
    return traduire(err, "publier");
  }
}

/** Rejette les brouillons des clés choisies (administrateur). */
export async function rejeterCles(
  page: string,
  cles: string[],
): Promise<ResultatOp<{ rejetees: string[] }>> {
  if (!PAGE_VALIDE.test(page) || cles.length === 0)
    return erreur("invalide", "Aucune clé à rejeter.");
  if (!(await exigerRole(true))) return REFUS_ADMIN;
  try {
    const r = await appelApi<{ rejetees?: string[] }>(`/api/v1/admin/contenus/${page}/rejeter`, {
      methode: "POST",
      corps: { cles },
    });
    return { statut: "ok", rejetees: r.rejetees ?? [] };
  } catch (err) {
    return traduire(err, "rejeter");
  }
}

/** Soumet la page à validation (éditeur ou administrateur). */
export async function soumettrePage(page: string, note: string): Promise<ResultatOp> {
  if (!PAGE_VALIDE.test(page)) return erreur("introuvable", "Page inconnue.");
  const propre = note.trim();
  if (propre.length > 500)
    return erreur("invalide", "La note ne peut pas dépasser 500 caractères.");
  if (!(await exigerRole(false))) return REFUS_SESSION;
  try {
    await appelApi(`/api/v1/admin/contenus/${page}/soumettre`, {
      methode: "POST",
      corps: propre === "" ? {} : { note: propre },
    });
    return { statut: "ok" };
  } catch (err) {
    return traduire(err, "soumettre cette page");
  }
}

/** Historique des publications d'une page (lecture, éditeur ou administrateur). */
export async function chargerHistorique(
  page: string,
): Promise<ResultatOp<{ versions: VersionHistorique[] }>> {
  if (!PAGE_VALIDE.test(page)) return erreur("introuvable", "Page inconnue.");
  if (!(await exigerRole(false))) return REFUS_SESSION;
  try {
    const r = await appelApi<unknown>(`/api/v1/admin/contenus/${page}/historique?limite=100`);
    const versions = lireHistorique(r);
    if (!versions) return erreur("reseau", "L'API a renvoyé un historique illisible.");
    return { statut: "ok", versions };
  } catch (err) {
    return traduire(err, "consulter l'historique");
  }
}

/** Restaure une version : crée un nouveau brouillon (administrateur). */
export async function restaurerVersion(
  page: string,
  cle: string,
  version: number,
): Promise<ResultatOp> {
  if (!PAGE_VALIDE.test(page) || cle === "" || !Number.isInteger(version) || version < 1) {
    return erreur("invalide", "Version invalide.");
  }
  if (!(await exigerRole(true))) return REFUS_ADMIN;
  try {
    await appelApi(`/api/v1/admin/contenus/${page}/restaurer`, {
      methode: "POST",
      corps: { cle, version },
    });
    return { statut: "ok" };
  } catch (err) {
    return traduire(err, "restaurer une version");
  }
}
