/**
 * Les portraits mis en lumière par la rubrique « Fenêtre de l'étudiant ».
 *
 * Données partagées par les variantes d'affichage à l'essai (pile de cartes,
 * galerie, magazine). Chaque entrée présente un étudiant ou un stagiaire : ce
 * qu'il a accompli, sa filière et son édition. En attendant les premières
 * publications, ce sont des exemples à remplacer par les vrais portraits.
 */
export interface Portrait {
  id: string;
  image: string;
  /** Nom de l'étudiant ou du stagiaire mis à l'honneur. */
  name: string;
  /** Filière et édition : « Génie civil · Édition 01 ». */
  program: string;
  /** Ce qui le met à l'honneur, en une phrase courte et forte. */
  highlight: string;
  /** Le récit, en quelques phrases. */
  story: string;
}

export const PORTRAITS: Portrait[] = [
  {
    id: "aissata",
    image: "/picture-11.jpg",
    name: "Aïssata Compaoré",
    program: "Génie civil · Édition 01",
    highlight: "Première de sa promotion, diplômée avec mention",
    story:
      "Arrivée à Tunis en 2021, elle a bouclé son cursus en tête de sa promotion. Elle prépare aujourd'hui un mastère et accompagne les nouveaux arrivants dans leurs démarches d'inscription.",
  },
  {
    id: "boukary",
    image: "/picture-1.jpg",
    name: "Boukary Zongo",
    program: "Sciences économiques · Édition 01",
    highlight: "Porte-parole de la communauté étudiante à Tunis",
    story:
      "Habitué des tribunes, il a porté la voix des étudiants burkinabè lors des Journées nationales d'engagement patriotique. Un parcours associatif qui prolonge son engagement sur le campus.",
  },
  {
    id: "fatimata",
    image: "/aesbt/jeppc-2026.jpg",
    name: "Fatimata Ouédraogo",
    program: "Génie électrique · Édition 02",
    highlight: "Sélectionnée pour représenter le Burkina Faso au JEPPC 2026",
    story:
      "Son projet de prototype solaire lui a valu une place dans la délégation nationale envoyée au Japan Education and Exhibition Pavilion Programme for Creativity, à l'aéroport de Tunis.",
  },
  {
    id: "yacouba",
    image: "/picture-7.jpg",
    name: "Yacouba Traoré",
    program: "Lettres modernes · Édition 01",
    highlight: "Ambassadeur de la culture burkinabè sur les scènes tunisiennes",
    story:
      "Danseur dans la troupe de l'association, il fait vivre les traditions du pays lors des journées culturelles de l'AESBT et des soirées inter-associations à Tunis.",
  },
  {
    id: "awa",
    image: "/picture-10.jpg",
    name: "Awa Kaboré",
    program: "Télécommunications · Édition 02",
    highlight: "Admise en double diplôme vers une école d'ingénieurs en Europe",
    story:
      "Après deux ans à SUP'COM, elle vient de décrocher une admission en double diplôme. Elle garde un pied à Tunis : elle y encadre encore le club d'entraide scolaire de l'association.",
  },
];
