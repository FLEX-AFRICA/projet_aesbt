/**
 * Deux ambiances pour la page d'accueil, à comparer visuellement.
 *
 * Les couleurs dérivent du logo AESBT (rouge, or, vert des drapeaux burkinabè
 * et tunisien). On expose un jeu de jetons identique pour les deux ambiances,
 * afin que les mêmes composants rendent l'une ou l'autre sans condition.
 */
export type HomeTheme = {
  name: "vibrant" | "clair";
  /** Fond général de la page. */
  bg: string;
  /** Fond des sections alternées. */
  bgAlt: string;
  /** Texte principal / titres. */
  ink: string;
  /** Texte secondaire. */
  inkSoft: string;
  /** Accent principal (boutons, liens). */
  accent: string;
  /** Accent secondaire (or). */
  gold: string;
  /** Vert (drapeau Burkina). */
  green: string;
  /** Texte sur fond accent. */
  onAccent: string;
  /** Bordures discrètes. */
  line: string;
  /** Fond de la barre flottante. */
  navBg: string;
  /** Texte de la barre flottante. */
  navInk: string;
};

export const THEME_VIBRANT: HomeTheme = {
  name: "vibrant",
  bg: "#FBF4EC", // crème chaud
  bgAlt: "#9E1B14", // rouge profond (sections en aplat)
  ink: "#1E140F",
  inkSoft: "#5A4A42",
  accent: "#C0271C", // rouge AESBT vif
  gold: "#E8A61E",
  green: "#2E7D4F",
  onAccent: "#FFF7EE",
  line: "rgba(30,20,15,0.10)",
  navBg: "#1E140F", // pill sombre qui ressort sur le crème
  navInk: "#FBF4EC",
};

export const THEME_CLAIR: HomeTheme = {
  name: "clair",
  bg: "#FCFCFB", // blanc cassé
  bgAlt: "#F3F1EC", // gris très clair chaud
  ink: "#1A1A1A",
  inkSoft: "#6B6B6B",
  accent: "#B4271C", // rouge AESBT, net
  gold: "#C9961B",
  green: "#2E7D4F",
  onAccent: "#FFFFFF",
  line: "rgba(0,0,0,0.08)",
  navBg: "rgba(255,255,255,0.72)",
  navInk: "#1A1A1A",
};

/** Photos réelles de l'association (page Facebook officielle). */
export const AESBT_PHOTOS = {
  staff: "/aesbt/staff-groupe.jpg",
  jeppc: "/aesbt/jeppc-2026.jpg",
  weekend: "/aesbt/weekend-integration.jpg",
} as const;

/** Coordonnées officielles relevées sur la page de l'association. */
export const AESBT_CONTACT = {
  phone: "+216 46 909 744",
  whatsapp: "+226 57 32 01 47",
  email: "aesbt.burkina@gmail.com",
  followers: "3,2 K",
} as const;
