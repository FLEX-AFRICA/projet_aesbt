"use server";

import { appelApi } from "@/lib/api-admin";

import type { Resultat, ResultatCreation } from "../actions";
import { creer, executer } from "../_commun/serveur";

/**
 * Actions d'administration des ressources (routes /api/v1/admin/ressources).
 * La validation d'une proposition et son rejet motivé restent dans la page Modération.
 */

const BASE = "/api/v1/admin/ressources";
const CHEMINS = ["/admin/ressources", "/admin/moderation", "/ressources", "/association"] as const;

export type TypeRessource = "lien" | "document";
export type VisibiliteRessource = "public" | "prive";

export interface ChampsNouvelleRessource {
  titre: string;
  description: string;
  type: TypeRessource;
  visibilite: VisibiliteRessource;
  /** Adresse du lien (type « lien » seulement). */
  url?: string;
  /** Média choisi (type « document » seulement). */
  document_id?: string;
  corps: string | null;
  categorie: string | null;
  filiere_id: string | null;
  /** Publier immédiatement plutôt que de garder en brouillon. */
  publier: boolean;
}

/** Modification partielle : seuls les champs présents sont envoyés. */
export type ChampsModificationRessource = Partial<
  Omit<ChampsNouvelleRessource, "publier" | "corps">
>;

export async function creerRessource(champs: ChampsNouvelleRessource): Promise<ResultatCreation> {
  return creer(BASE, champs, CHEMINS);
}

export async function modifierRessource(
  id: string,
  champs: ChampsModificationRessource,
): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs }),
    CHEMINS,
  );
}

/** Publier (brouillon, proposition ou archive) ou retirer du site (route depublier : statut archivé). */
export async function changerStatutRessource(
  id: string,
  cible: "brouillon" | "publie" | "archive",
): Promise<Resultat> {
  if (cible === "brouillon") {
    return { ok: false, message: "L'API ne permet pas de repasser une ressource en brouillon." };
  }
  const action = cible === "publie" ? "publier" : "depublier";
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}/${action}`, { methode: "POST", corps: {} }),
    CHEMINS,
  );
}

/** Fait monter ou descendre une ressource d'un cran (l'ordre est géré par l'API, jamais saisi). */
export async function deplacerRessource(id: string, direction: "haut" | "bas"): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`${BASE}/${encodeURIComponent(id)}/deplacer`, {
        methode: "POST",
        corps: { direction },
      }),
    CHEMINS,
  );
}

export async function supprimerRessource(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "DELETE" }),
    CHEMINS,
  );
}
