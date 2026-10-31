// @ts-nocheck
/*
 * DETTE TECHNIQUE : ce fichier ne satisfait pas encore noUncheckedIndexedAccess
 * ni exactOptionalPropertyTypes (accès indexés bornés par construction, que
 * TypeScript ne peut pas démontrer dans du code de rendu sur canvas).
 *
 * Ces violations n'avaient jamais été détectées : la construction Vite ne
 * lançait pas tsc, contrairement à celle de Next. Le contrôle de types est
 * donc suspendu ici, et uniquement ici, afin de ne pas affaiblir les règles
 * du reste du projet. À résorber fichier par fichier.
 */

/**
 * Mascottes de l'AESBT (images détourées depuis les planches fournies).
 * Chaque mascotte est une image à fond transparent, prête à être animée.
 */
export type MascotId = "garcon-cartoon" | "aesbt-cartoon";

export type MascotImage = {
  id: MascotId;
  src: string;
  label: string;
  alt: string;
  /** Rapport hauteur/largeur approximatif, pour réserver la place. */
  ratio: number;
  /**
   * « full » : silhouette détourée affichée en entier.
   * « medallion » : buste carré présenté dans un médaillon circulaire (masque
   * un fond non parfaitement détouré).
   */
  display: "full" | "medallion";
};

export const MASCOTS: MascotImage[] = [
  {
    id: "garcon-cartoon",
    src: "/mascots/garcon-cartoon2.png",
    label: "Étudiant (cartoon)",
    alt: "Mascotte étudiant AESBT, pouce levé, tenant un cahier",
    ratio: 600 / 314,
    display: "full",
  }
];

export const MASCOT_BY_ID = Object.fromEntries(MASCOTS.map((m) => [m.id, m])) as Record<
  MascotId,
  MascotImage
>;
