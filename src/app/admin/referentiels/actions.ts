"use server";

import { appelApi } from "@/lib/api-admin";

import type { Resultat, ResultatCreation } from "../actions";
import { creer, executer } from "../_commun/serveur";

/**
 * Actions d'administration des référentiels (routes /api/v1/admin/referentiels).
 * Les entrées ne sont jamais supprimées mais désactivées : les profils et les
 * ressources qui les référencent resteraient sans classement.
 */

const BASE = "/api/v1/admin/referentiels";
/** Les listes proposées dans les formulaires dépendent de ces pages. */
const CHEMINS = ["/admin/referentiels", "/admin/ressources", "/cellule/profil"] as const;

export interface ChampsFiliere {
  nom: string;
  domaine: string | null;
  ordre: number;
  actif: boolean;
}

export interface ChampsUniversite {
  nom: string;
  ville: string | null;
  site_web: string | null;
  ordre: number;
  actif: boolean;
}

export async function creerFiliereAdmin(champs: ChampsFiliere): Promise<ResultatCreation> {
  return creer(`${BASE}/filieres`, champs, CHEMINS);
}

export async function modifierFiliere(
  id: string,
  champs: Partial<ChampsFiliere>,
): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`${BASE}/filieres/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs }),
    CHEMINS,
  );
}

export async function creerUniversiteAdmin(champs: ChampsUniversite): Promise<ResultatCreation> {
  return creer(`${BASE}/universites`, champs, CHEMINS);
}

export async function modifierUniversite(
  id: string,
  champs: Partial<ChampsUniversite>,
): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`${BASE}/universites/${encodeURIComponent(id)}`, {
        methode: "PATCH",
        corps: champs,
      }),
    CHEMINS,
  );
}

/** Création d'un niveau : même route que le formulaire des membres (dédoublonnage compris). */
export async function creerNiveauAdmin(libelle: string): Promise<ResultatCreation> {
  return creer("/api/v1/referentiels/niveaux", { libelle }, CHEMINS);
}

export async function modifierNiveau(
  id: string,
  champs: { libelle?: string; ordre?: number },
): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`${BASE}/niveaux/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs }),
    CHEMINS,
  );
}
