import { draftMode } from "next/headers";

import { DEFAUTS, type ValeurContenu } from "@/contenus/defauts";
import { obtenirContenus } from "@/lib/api";
import { appelApi, peutEditerContenus, sessionCourante } from "@/lib/api-admin";

/** Contenus d'une page : clé du registre vers valeur. */
export type Contenus = Record<string, ValeurContenu>;

/**
 * Contenus d'une page, avec repli sur les défauts locaux.
 *
 * - API absente, injoignable ou page inconnue : défauts locaux seuls.
 * - Sinon : défauts locaux, surchargés par les valeurs publiées. Une clé
 *   inconnue du côté frontend est ignorée, une valeur `undefined` aussi, pour
 *   que le site ne perde jamais un texte.
 *
 * Fonction pure côté repli : mêmes données qu'aujourd'hui sans backend.
 */
export function fusionnerContenus(page: string, publies: Record<string, unknown> | null): Contenus {
  const defauts = DEFAUTS[page] ?? {};
  const resultat: Contenus = { ...defauts };
  if (!publies) return resultat;

  for (const cle of Object.keys(defauts)) {
    const valeur = publies[cle];
    if (valeur !== undefined) resultat[cle] = valeur as ValeurContenu;
  }
  return resultat;
}

/** Média référencé par un identifiant d'image : de quoi construire son URL. */
export interface MediaContenu {
  chemin: string;
  alt: string;
}

/** Table `{ identifiant de média: { chemin, alt } }` renvoyée par l'API. */
export type Medias = Record<string, MediaContenu>;

/** Contenus d'une page (blocs communs fusionnés) et médias de ses images. */
export interface ContenusPage {
  contenus: Contenus;
  medias: Medias;
}

/** Page des blocs partagés (bande d'adhésion, navigation, pied de page). */
export const PAGE_COMMUNE = "commun";

/** Pages dont le rendu utilise des blocs partagés : leurs clés `commun.*` sont chargées avec les leurs. */
const PAGES_AVEC_COMMUN = new Set(["accueil", "association"]);

/** Pages à lire pour rendre `page` : elle-même, plus `commun` quand elle en a besoin. */
export function pagesALire(page: string): string[] {
  return PAGES_AVEC_COMMUN.has(page) ? [page, PAGE_COMMUNE] : [page];
}

/** Filtre une table de médias reçue de l'API : seules les entrées bien formées passent. */
export function medias(brut: unknown): Medias {
  const resultat: Medias = {};
  if (typeof brut !== "object" || brut === null || Array.isArray(brut)) return resultat;
  for (const [id, m] of Object.entries(brut)) {
    if (typeof m !== "object" || m === null) continue;
    const { chemin, alt } = m as { chemin?: unknown; alt?: unknown };
    if (typeof chemin === "string" && chemin !== "") {
      resultat[id] = { chemin, alt: typeof alt === "string" ? alt : "" };
    }
  }
  return resultat;
}

/** Contenus publiés (défauts locaux en repli) et médias, `commun` fusionné quand utile. */
export async function chargerContenusEtMedias(page: string): Promise<ContenusPage> {
  const reponses = await Promise.all(
    pagesALire(page).map(async (p) => ({ p, reponse: await obtenirContenus(p) })),
  );
  const resultat: ContenusPage = { contenus: {}, medias: {} };
  for (const { p, reponse } of reponses) {
    Object.assign(resultat.contenus, fusionnerContenus(p, reponse?.contenus ?? null));
    Object.assign(resultat.medias, medias(reponse?.medias));
  }
  return resultat;
}

/** Contenus publiés d'une page, avec repli sur les défauts locaux (clés `commun.*` incluses si utile). */
export async function chargerContenus(page: string): Promise<Contenus> {
  return (await chargerContenusEtMedias(page)).contenus;
}

/** Champ tel que renvoyé par GET /api/v1/admin/contenus/:page (partie utile). */
interface ChampAdmin {
  cle: string;
  /** Valeur publiée, ou défaut du registre si rien n'est publié. */
  valeur: unknown;
  /** "publie" si une valeur est publiée, "defaut" sinon. */
  source: "defaut" | "publie";
  /** Valeur de brouillon, null s'il n'y en a pas. */
  brouillon: unknown;
}

/**
 * Fusion d'aperçu : brouillon, sinon publié, sinon défaut local.
 *
 * Limite connue : l'API renvoie `brouillon: null` aussi bien pour « pas de
 * brouillon » que pour « brouillon qui retire l'image » ; un retrait en
 * brouillon n'apparaît donc pas dans l'aperçu serveur (il apparaît en direct
 * via postMessage dans l'éditeur).
 */
export function fusionnerBrouillon(page: string, champs: ChampAdmin[]): Contenus {
  const defauts = DEFAUTS[page] ?? {};
  const resultat: Contenus = { ...defauts };
  for (const champ of champs) {
    if (!(champ.cle in defauts)) continue;
    if (champ.brouillon !== null && champ.brouillon !== undefined) {
      resultat[champ.cle] = champ.brouillon as ValeurContenu;
    } else if (champ.source === "publie" && champ.valeur !== undefined) {
      resultat[champ.cle] = champ.valeur as ValeurContenu;
    }
  }
  return resultat;
}

/**
 * Contenus d'une page pour la route d'aperçu, et indication du mode édition.
 *
 * ATTENTION : appelle `draftMode()` et lit les cookies, donc rend la page
 * dynamique. À n'utiliser que depuis les routes d'aperçu (/apercu/...), jamais
 * depuis une page publique, qui doit rester statique (ISR).
 *
 * `modeEdition` est vrai seulement si le mode brouillon est actif ET que la
 * session est celle d'un éditeur ou d'un administrateur. Toute erreur du
 * chemin brouillon retombe sur le publié.
 */
export async function resoudreContenusPage(
  page: string,
): Promise<ContenusPage & { modeEdition: boolean }> {
  let autorise = false;
  try {
    if ((await draftMode()).isEnabled) {
      autorise = peutEditerContenus(await sessionCourante());
    }
  } catch {
    autorise = false;
  }

  if (autorise) {
    try {
      const resultat: ContenusPage = { contenus: {}, medias: {} };
      for (const p of pagesALire(page)) {
        const reponse = await appelApi<{ champs: ChampAdmin[]; medias?: unknown }>(
          `/api/v1/admin/contenus/${encodeURIComponent(p)}`,
        );
        Object.assign(resultat.contenus, fusionnerBrouillon(p, reponse.champs));
        Object.assign(resultat.medias, medias(reponse.medias));
      }
      return { ...resultat, modeEdition: true };
    } catch {
      // Jamais d'exception visible : on retombe sur le publié.
      return { ...(await chargerContenusEtMedias(page)), modeEdition: true };
    }
  }

  return { ...(await chargerContenusEtMedias(page)), modeEdition: false };
}

/** Contenus d'une page : brouillon pour un éditeur en mode brouillon, publié sinon. */
export async function chargerContenusPage(page: string): Promise<Contenus> {
  return (await resoudreContenusPage(page)).contenus;
}
