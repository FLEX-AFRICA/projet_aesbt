import { CONTACT, SOCIALS, type SocialLink } from "@/config/site";
import { obtenirParametres } from "@/lib/api";

export interface Coordonnees {
  email: string | null;
  phone: string | null;
  address: string | null;
  socials: SocialLink[];
  /** Lien d'adhésion (`adhesion.url`), null si non renseigné. */
  adhesionUrl: string | null;
}

/** Valeur renseignée (non vide) ou null. */
function valeur(parametres: Record<string, string | null>, cle: string): string | null {
  const brut = parametres[cle];
  if (typeof brut !== "string") return null;
  const nettoye = brut.trim();
  return nettoye.length > 0 ? nettoye : null;
}

/** Clé de paramètre de chaque réseau, par libellé de `SOCIALS`. */
const CLES_RESEAUX: Record<string, string> = {
  Facebook: "social.facebook",
  Instagram: "social.instagram",
  LinkedIn: "social.linkedin",
  TikTok: "social.tiktok",
};

/**
 * Fusion pure : valeur de l'API quand elle est renseignée, sinon repli sur
 * `config/site.ts`. L'ordre et les libellés des réseaux restent ceux de
 * `SOCIALS`.
 */
export function fusionnerCoordonnees(parametres: Record<string, string | null>): Coordonnees {
  return {
    email: valeur(parametres, "contact.email") ?? CONTACT.email,
    phone: valeur(parametres, "contact.telephone") ?? CONTACT.phone,
    address: valeur(parametres, "contact.adresse") ?? CONTACT.address,
    socials: SOCIALS.map((s) => ({
      label: s.label,
      href: valeur(parametres, CLES_RESEAUX[s.label] ?? "") ?? s.href,
    })),
    adhesionUrl: valeur(parametres, "adhesion.url"),
  };
}

export async function chargerCoordonnees(): Promise<Coordonnees> {
  return fusionnerCoordonnees(await obtenirParametres());
}
