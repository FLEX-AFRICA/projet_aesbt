"use server";

import { revalidatePath } from "next/cache";

import { appelApi } from "@/lib/api-admin";

import type { Resultat, ResultatCreation } from "../actions";
import { changerStatut, creer, executer, messageErreur } from "../_commun/serveur";

/** Actions d'administration des événements (routes /api/v1/admin/evenements). */

const BASE = "/api/v1/admin/evenements";
const CHEMINS = ["/admin/evenements", "/evenements"] as const;
const CHEMINS_ALBUM = ["/admin/evenements", "/admin/galerie", "/evenements", "/galerie"] as const;

export interface ChampsEvenement {
  titre: string;
  description: string | null;
  /** ISO UTC ou null. */
  debute_le: string | null;
  lieu: string | null;
  couverture_id: string | null;
  inscription_url: string | null;
  lien_photos: string | null;
}

export async function creerEvenement(champs: ChampsEvenement): Promise<ResultatCreation> {
  return creer(BASE, champs, CHEMINS);
}

export async function modifierEvenement(id: string, champs: ChampsEvenement): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs }),
    CHEMINS,
  );
}

export async function changerStatutEvenement(
  id: string,
  cible: "brouillon" | "publie" | "archive",
): Promise<Resultat> {
  return changerStatut(BASE, id, cible, CHEMINS);
}

export async function supprimerEvenement(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "DELETE" }),
    CHEMINS,
  );
}

// --- Photos : albums liés à l'événement -----------------------------------

const BASE_ALBUMS = "/api/v1/admin/albums";
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Résultat de la création d'un événement suivie de celle de son album. */
export interface ResultatEvenementAlbum extends Resultat {
  /** Identifiant de l'événement s'il existe (même si l'album a échoué). */
  evenementId?: string;
  albumId?: string;
}

/**
 * Crée l'album d'un événement existant : titre et date repris de l'événement,
 * brouillon sans photo. `date` est au format AAAA-MM-JJ.
 */
export async function creerAlbumPourEvenement(
  evenementId: string,
  titre: string,
  date: string,
): Promise<ResultatCreation> {
  if (!FORMAT_DATE.test(date)) {
    return { ok: false, message: "La date de l'album est invalide." };
  }
  return creer(
    BASE_ALBUMS,
    { titre, description: null, date, couverture_id: null, evenement_id: evenementId },
    CHEMINS_ALBUM,
  );
}

/**
 * Enregistre l'événement puis crée son album en une seule opération. Si
 * l'album échoue, l'événement reste créé et son identifiant est renvoyé avec
 * un message explicite, pour ne pas le créer deux fois.
 */
export async function creerEvenementEtAlbum(
  champs: ChampsEvenement,
  date: string,
): Promise<ResultatEvenementAlbum> {
  const evenement = await creer(BASE, champs, CHEMINS_ALBUM);
  if (!evenement.ok || !evenement.id) {
    return { ok: false, message: evenement.message ?? "Création de l'événement impossible." };
  }
  const album = await creerAlbumPourEvenement(evenement.id, champs.titre, date);
  if (!album.ok || !album.id) {
    return {
      ok: false,
      evenementId: evenement.id,
      message: `L'événement a bien été enregistré, mais son album n'a pas pu être créé : ${album.message ?? "erreur inconnue"}`,
    };
  }
  return { ok: true, evenementId: evenement.id, albumId: album.id };
}

/** Lie un album à un événement, ou le délie (`evenementId` nul). */
export async function lierAlbum(albumId: string, evenementId: string | null): Promise<Resultat> {
  try {
    await appelApi(`${BASE_ALBUMS}/${encodeURIComponent(albumId)}`, {
      methode: "PATCH",
      corps: { evenement_id: evenementId },
    });
    for (const chemin of CHEMINS_ALBUM) revalidatePath(chemin);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: messageErreur(err, "La liaison de l'album a échoué.") };
  }
}
