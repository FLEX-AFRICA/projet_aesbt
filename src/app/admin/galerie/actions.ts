"use server";

import { appelApi } from "@/lib/api-admin";

import type { Resultat, ResultatCreation } from "../actions";
import { changerStatut, creer, executer } from "../_commun/serveur";

/** Actions d'administration des albums de la Galerie (routes /api/v1/admin/albums). */

const BASE = "/api/v1/admin/albums";
const CHEMINS = ["/admin/galerie", "/galerie"] as const;

export interface ChampsAlbum {
  titre: string;
  description: string | null;
  /** Format AAAA-MM-JJ. */
  date: string;
  couverture_id: string | null;
  /** Événement lié, ou null pour aucun. */
  evenement_id: string | null;
}

export interface PhotoAlbum {
  media_id: string;
  legende: string | null;
}

export async function creerAlbum(champs: ChampsAlbum): Promise<ResultatCreation> {
  return creer(BASE, champs, CHEMINS);
}

export async function modifierAlbum(id: string, champs: ChampsAlbum): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs }),
    [...CHEMINS, `/admin/galerie/${id}`],
  );
}

export async function changerStatutAlbum(
  id: string,
  cible: "brouillon" | "publie" | "archive",
): Promise<Resultat> {
  return changerStatut(BASE, id, cible, [...CHEMINS, `/admin/galerie/${id}`]);
}

export async function supprimerAlbum(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "DELETE" }),
    CHEMINS,
  );
}

/** Remplace l'ensemble des photos de l'album, dans l'ordre fourni. */
export async function enregistrerPhotosAlbum(id: string, photos: PhotoAlbum[]): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`${BASE}/${encodeURIComponent(id)}/photos`, {
        methode: "PUT",
        corps: { photos },
      }),
    [...CHEMINS, `/admin/galerie/${id}`],
  );
}
