"use server";

import { revalidatePath } from "next/cache";

import { appelApi } from "@/lib/api-admin";
import { messageErreur } from "@/app/admin/_commun/serveur";

/**
 * Création immédiate d'une valeur de référentiel depuis un formulaire (option
 * « Autre »). Réservé aux comptes validés : l'API décide, ces actions
 * relaient seulement. Si la valeur existe déjà (même casse ou accents
 * différents), l'API renvoie l'existante et `cree` vaut false.
 */

export interface ResultatAjout {
  ok: boolean;
  /** Identifiant de la valeur créée, ou de l'existante en cas de doublon. */
  id?: string;
  libelle?: string;
  cree?: boolean;
  message?: string;
}

interface ReponseAjout {
  id: string;
  nom?: string;
  libelle?: string;
  cree: boolean;
}

async function ajouter(
  chemin: string,
  corps: Record<string, string>,
  texte: string,
  max: number,
): Promise<ResultatAjout> {
  const net = texte.trim();
  if (net.length < 2 || net.length > max) {
    return { ok: false, message: `Saisissez entre 2 et ${max} caractères.` };
  }
  try {
    const r = await appelApi<ReponseAjout>(`/api/v1/referentiels/${chemin}`, {
      methode: "POST",
      corps,
    });
    revalidatePath("/admin/referentiels");
    return { ok: true, id: r.id, libelle: r.nom ?? r.libelle ?? net, cree: r.cree };
  } catch (err) {
    return { ok: false, message: messageErreur(err, "Ajout impossible. Réessayez.") };
  }
}

export async function ajouterFiliere(nom: string): Promise<ResultatAjout> {
  return ajouter("filieres", { nom: nom.trim() }, nom, 120);
}

export async function ajouterUniversite(nom: string): Promise<ResultatAjout> {
  return ajouter("universites", { nom: nom.trim() }, nom, 160);
}

export async function ajouterNiveau(libelle: string): Promise<ResultatAjout> {
  return ajouter("niveaux", { libelle: libelle.trim() }, libelle, 40);
}
