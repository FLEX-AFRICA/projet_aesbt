import type { NomIcone } from "@/components/espace";

/**
 * Catalogue des droits d'un éditeur, miroir de celui du backend.
 *
 * Le backend reste la source de vérité (GET /admin/droits-editeur et refus 403
 * `droits_insuffisants`) : cette table sert à construire la navigation, à
 * contrôler le périmètre côté interface et de repli d'affichage.
 */
export interface DroitEditeur {
  cle: string;
  libelle: string;
  description: string;
  /** Préfixe de chemin des pages d'administration liées à ce droit. */
  chemin: string;
  /** Anciens chemins encore couverts (ils redirigent vers `chemin`). */
  anciensChemins?: readonly string[];
  icone: NomIcone;
}

export const DROITS_EDITEUR: readonly DroitEditeur[] = [
  {
    cle: "editeur_visuel",
    libelle: "Éditeur visuel",
    description: "Préparer et soumettre des modifications des textes et images du site.",
    chemin: "/admin/editeur",
    icone: "editeur",
  },
  {
    cle: "publications",
    libelle: "Publications",
    description: "Rédiger et gérer les actualités et articles.",
    chemin: "/admin/publications",
    icone: "publications",
  },
  {
    cle: "albums",
    libelle: "Albums photo",
    description:
      "Ouvre la Galerie : créer des albums, y ajouter des photos et les lier à un événement.",
    chemin: "/admin/galerie",
    anciensChemins: ["/admin/albums"],
    icone: "albums",
  },
  {
    cle: "evenements",
    libelle: "Événements",
    description: "Créer et modifier les événements de l'association.",
    chemin: "/admin/evenements",
    icone: "evenements",
  },
  {
    cle: "documents",
    libelle: "Documents institutionnels",
    description:
      "Ouvre Ressources et documents : gérer les fichiers (statuts, rapports) et choisir lesquels sont publics ou privés.",
    chemin: "/admin/ressources",
    anciensChemins: ["/admin/documents"],
    icone: "documents",
  },
  {
    cle: "ressources",
    libelle: "Ressources",
    description:
      "Ouvre Ressources et documents : gérer les liens et fichiers pédagogiques, sans pouvoir les publier ni les rejeter.",
    chemin: "/admin/ressources",
    anciensChemins: ["/admin/documents"],
    icone: "ressources",
  },
  {
    cle: "mediatheque",
    libelle: "Médiathèque",
    description:
      "Ouvre la Galerie : téléverser les images de la bibliothèque (couvertures, pages, albums) et corriger leur texte alternatif.",
    chemin: "/admin/galerie",
    anciensChemins: ["/admin/medias"],
    icone: "mediatheque",
  },
  {
    cle: "membres_bureau",
    libelle: "Membres du bureau",
    description: "Mettre à jour la liste et les fiches des membres du bureau.",
    chemin: "/admin/membres",
    icone: "membres",
  },
];

/** Droit accordé par défaut à un nouvel éditeur. */
export const DROIT_PAR_DEFAUT = "editeur_visuel";

export function libelleDroit(cle: string): string {
  return DROITS_EDITEUR.find((d) => d.cle === cle)?.libelle ?? cle;
}

/** Vrai si `chemin` relève du droit, y compris par un de ses anciens chemins. */
export function cheminDuDroit(chemin: string, droit: DroitEditeur): boolean {
  return [droit.chemin, ...(droit.anciensChemins ?? [])].some((p) => sousChemin(chemin, p));
}

/** Vrai si `chemin` est `prefixe` ou une sous-page de `prefixe`. */
export function sousChemin(chemin: string, prefixe: string): boolean {
  return chemin === prefixe || chemin.startsWith(`${prefixe}/`);
}

/** Droit qui gouverne ce chemin, ou undefined s'il ne relève d'aucun droit d'éditeur. */
export function droitRequis(chemin: string): DroitEditeur | undefined {
  return DROITS_EDITEUR.find((d) => cheminDuDroit(chemin, d));
}
