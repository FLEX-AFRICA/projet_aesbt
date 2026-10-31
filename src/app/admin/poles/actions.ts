"use server";

import { revalidatePath } from "next/cache";

import {
  ajouterMembrePoleApi,
  creerPoleApi,
  listerIconesPoles,
  messageErreurPole,
  modifierPoleApi,
  refuserDemandeApi,
  rechercherComptesApi,
  retirerMembrePoleApi,
  supprimerPoleApi,
  validerDemandeApi,
  type ChampsPole,
  type CompteRecherche,
  type IconePole,
} from "@/lib/api-admin-poles";

import type { Resultat, ResultatCreation } from "../actions";

/** Actions d'administration des pôles (routes /api/v1/admin/poles). */

const CHEMINS = ["/admin/poles", "/admin"] as const;

export interface ResultatRechercheComptes {
  ok: boolean;
  comptes: CompteRecherche[];
  message?: string;
}

async function executer(
  action: () => Promise<unknown>,
  chemins: readonly string[],
): Promise<Resultat> {
  try {
    await action();
    for (const chemin of [...CHEMINS, ...chemins]) revalidatePath(chemin);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: messageErreurPole(err) };
  }
}

export async function creerPole(champs: ChampsPole): Promise<ResultatCreation> {
  try {
    const { id } = await creerPoleApi(champs);
    for (const chemin of CHEMINS) revalidatePath(chemin);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, message: messageErreurPole(err, "Création impossible. Réessayez.") };
  }
}

export async function modifierPole(id: string, champs: Partial<ChampsPole>): Promise<Resultat> {
  return executer(() => modifierPoleApi(id, champs), [`/admin/poles/${id}`]);
}

export async function supprimerPole(id: string): Promise<Resultat> {
  return executer(() => supprimerPoleApi(id), [`/admin/poles/${id}`]);
}

export async function ajouterMembrePole(poleId: string, userId: string): Promise<Resultat> {
  return executer(() => ajouterMembrePoleApi(poleId, userId), [`/admin/poles/${poleId}`]);
}

export async function retirerMembrePole(poleId: string, userId: string): Promise<Resultat> {
  return executer(() => retirerMembrePoleApi(poleId, userId), [`/admin/poles/${poleId}`]);
}

export async function validerDemandePole(
  demandeId: string,
  poleId: string | undefined,
): Promise<Resultat> {
  return executer(() => validerDemandeApi(demandeId), poleId ? [`/admin/poles/${poleId}`] : []);
}

export async function refuserDemandePole(
  demandeId: string,
  poleId: string | undefined,
  motif: string,
): Promise<Resultat> {
  const net = motif.trim();
  if (net.length < 5) return { ok: false, message: "Un motif d'au moins 5 caractères est exigé." };
  if (net.length > 1000) {
    return { ok: false, message: "Le motif ne peut pas dépasser 1000 caractères." };
  }
  return executer(
    () => refuserDemandeApi(demandeId, net),
    poleId ? [`/admin/poles/${poleId}`] : [],
  );
}

/** Recherche de comptes validés pour l'ajout d'un membre. */
export async function rechercherComptes(q: string): Promise<ResultatRechercheComptes> {
  const net = q.trim();
  // Requête vide : les comptes récents. Un seul caractère : rien à chercher.
  if (net.length === 1) return { ok: true, comptes: [] };
  try {
    return { ok: true, comptes: await rechercherComptesApi(net.slice(0, 80)) };
  } catch (err) {
    return {
      ok: false,
      comptes: [],
      message: messageErreurPole(err, "La recherche a échoué. Réessayez."),
    };
  }
}

/** Icônes proposées pour un pôle ; liste vide si l'API n'a pas répondu. */
export async function lireIconesPoles(): Promise<IconePole[]> {
  try {
    return await listerIconesPoles();
  } catch {
    return [];
  }
}
