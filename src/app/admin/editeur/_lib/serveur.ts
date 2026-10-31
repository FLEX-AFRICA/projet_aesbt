import { appelApi, type RoleCompte } from "@/lib/api-admin";

import { lireResume, lireSoumission, type ResumePage, type Soumission } from "./detail";
import type { MediaEditeur } from "./types";

/** Chargements côté serveur de l'éditeur (jamais importé par un composant client). */

const MEDIA = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");

export type ChargementPage =
  | { statut: "ok"; reponse: unknown }
  | { statut: "inconnue" }
  | { statut: "erreur"; message: string };

/** État brut d'une page : GET /api/v1/admin/contenus/:page. */
export async function chargerPage(page: string): Promise<ChargementPage> {
  try {
    const reponse = await appelApi<unknown>(`/api/v1/admin/contenus/${page}`);
    return { statut: "ok", reponse };
  } catch (err) {
    const statut = typeof err === "object" && err !== null && "statut" in err ? err.statut : null;
    if (statut === 404) return { statut: "inconnue" };
    return { statut: "erreur", message: "Impossible de charger la page depuis l'API." };
  }
}

/**
 * Résumé de toutes les pages (un seul appel) : brouillons et soumission en
 * attente. Renvoie null si l'API est injoignable ou répond autre chose.
 */
export async function chargerResume(): Promise<ResumePage[] | null> {
  try {
    return lireResume(await appelApi<unknown>("/api/v1/admin/contenus/resume"));
  } catch {
    return null;
  }
}

/** Soumission en attente d'une page, ou null (aucune, ou résumé indisponible). */
export async function chargerSoumission(page: string): Promise<Soumission | null> {
  try {
    const reponse = await appelApi<{ pages?: { page?: unknown; soumission?: unknown }[] }>(
      "/api/v1/admin/contenus/resume",
    );
    const ligne = reponse.pages?.find((p) => p.page === page);
    return ligne ? lireSoumission(ligne.soumission, page) : null;
  } catch {
    return null;
  }
}

/**
 * Médias proposés au sélecteur.
 *
 * L'administrateur garde GET /admin/medias ; l'éditeur utilise la lecture
 * seule GET /admin/contenus/medias (même forme de réponse). Un échec donne une
 * liste vide, sans bloquer l'édition.
 */
export async function chargerMedias(role: RoleCompte): Promise<MediaEditeur[]> {
  const chemin =
    role === "admin" ? "/api/v1/admin/medias?taille=60" : "/api/v1/admin/contenus/medias?taille=60";
  try {
    const { medias } = await appelApi<{ medias: { id: string; alt: string; chemin: string }[] }>(
      chemin,
    );
    return medias.map((m) => ({
      id: m.id,
      alt: m.alt,
      vignette: MEDIA ? `${MEDIA}/${m.chemin}-thumb.webp` : null,
      apercu: MEDIA ? `${MEDIA}/${m.chemin}-md.webp` : null,
    }));
  } catch {
    return [];
  }
}
