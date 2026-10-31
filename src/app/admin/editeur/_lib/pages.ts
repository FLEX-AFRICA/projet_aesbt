/**
 * Pages éditables par l'éditeur visuel. Pour en ajouter une : une ligne ici
 * (le registre backend et la route /apercu/<slug> doivent exister).
 */
export interface PageEditable {
  slug: string;
  titre: string;
  description: string;
  /** Chemin de la page publique. */
  cheminPublic: string;
}

export const PAGES_EDITABLES: readonly PageEditable[] = [
  {
    slug: "accueil",
    titre: "L'accueil",
    description: "Hero, bandes de présentation, cellule scientifique et contact.",
    cheminPublic: "/",
  },
  {
    slug: "association",
    titre: "L'association",
    description: "En-tête, mot du Président et missions.",
    cheminPublic: "/association",
  },
];

export function pageEditable(slug: string): PageEditable | undefined {
  return PAGES_EDITABLES.find((p) => p.slug === slug);
}
