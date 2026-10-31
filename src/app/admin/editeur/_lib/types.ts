import type { ValeurContenu } from "@/contenus/defauts";

export type { ValeurContenu };

/** Types de champ scalaires (utilisables comme sous-champ d'une liste). */
export type TypeScalaire = "texte" | "texte_long" | "lien" | "image" | "nombre";
export type TypeChampEditeur = TypeScalaire | "liste";

/** Sous-champ d'un élément de liste. */
export interface SousChamp {
  nom: string;
  type: TypeScalaire;
  libelle: string;
  max: number | null;
}

/**
 * Champ éditable tel que l'éditeur le manipule, après normalisation de la
 * réponse de GET /admin/contenus/:page (voir `lireChamps`).
 */
export interface ChampEditeur {
  cle: string;
  type: TypeChampEditeur;
  libelle: string;
  /** Nom de groupe (fourni par l'API, sinon déduit de la clé). */
  groupe: string;
  /** Position dans la page (fournie par l'API, sinon ordre de réception). */
  ordre: number;
  /** Longueur maximale (texte, lien) ou nombre maximal d'éléments (liste). */
  max: number | null;
  minValeur: number | null;
  maxValeur: number | null;
  /** Structure des éléments d'une liste, déduite des valeurs si absente. */
  sousChamps: SousChamp[] | null;
  /** Version lue au chargement (0 si jamais écrite). */
  version: number;
  /** Valeur de départ : brouillon enregistré s'il existe, sinon valeur effective. */
  base: ValeurContenu;
}

/** Valeurs par clé de champ. */
export type Valeurs = Record<string, ValeurContenu>;

/** Média proposé au sélecteur, avec l'URL du dérivé moyen pour l'aperçu. */
export interface MediaEditeur {
  id: string;
  alt: string;
  vignette: string | null;
  /** Dérivé moyen (-md) pour l'aperçu en direct, ou null. */
  apercu: string | null;
}
