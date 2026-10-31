import { appelApi } from "@/lib/api-admin";

/**
 * Ressources réservées aux membres connectés (rubrique Communauté).
 * Serveur uniquement : tout passe par `appelApi`, qui relaie le cookie de session.
 */

export type OrigineRessource = "admin" | "communaute";

export interface RessourceMembre {
  id: string;
  slug: string;
  titre: string;
  description: string;
  /** « lien » : `url` est renseignée ; « fichier » : `document_url` l'est. */
  type: "lien" | "fichier" | string;
  url: string | null;
  document_url: string | null;
  categorie: string | null;
  filiere_nom: string | null;
  origine: OrigineRessource | string;
  propose_par_nom: string | null;
  publie_le: string | null;
}

export interface PageRessourcesMembre {
  ressources: RessourceMembre[];
  page: number;
  taille: number;
  total: number;
}

export interface FiltresRessourcesMembre {
  page?: number;
  taille?: number;
  q?: string;
  origine?: OrigineRessource;
  categorie?: string;
}

/** Liste paginée des ressources publiées en privé (GET /api/v1/ressources/membres). */
export async function lireRessourcesMembre(
  filtres: FiltresRessourcesMembre = {},
): Promise<PageRessourcesMembre> {
  const p = new URLSearchParams();
  p.set("page", String(filtres.page ?? 1));
  p.set("taille", String(filtres.taille ?? 12));
  if (filtres.q) p.set("q", filtres.q);
  if (filtres.origine) p.set("origine", filtres.origine);
  if (filtres.categorie) p.set("categorie", filtres.categorie);
  return appelApi<PageRessourcesMembre>(`/api/v1/ressources/membres?${p.toString()}`);
}

/** Cible à ouvrir pour une ressource : le lien, ou le fichier selon le type. */
export function cibleRessource(r: RessourceMembre): string | null {
  return (r.type === "fichier" ? r.document_url : r.url) ?? r.url ?? r.document_url;
}
