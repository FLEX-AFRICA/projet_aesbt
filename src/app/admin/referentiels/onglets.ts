/** Onglets et formes des données de la page Référentiels (partagés serveur et client). */

export const ONGLETS = [
  { valeur: "filieres", libelle: "Filières" },
  { valeur: "universites", libelle: "Universités" },
  { valeur: "niveaux", libelle: "Niveaux" },
] as const;

export type OngletRef = (typeof ONGLETS)[number]["valeur"];

export interface FiliereRef {
  id: string;
  nom: string;
  slug: string;
  domaine: string | null;
  actif: number;
  ordre: number;
}

export interface UniversiteRef {
  id: string;
  nom: string;
  slug: string;
  ville: string | null;
  site_web: string | null;
  actif: number;
  ordre: number;
}

export interface NiveauRef {
  id: string;
  libelle: string;
  ordre: number;
}
