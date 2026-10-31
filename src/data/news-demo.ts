import type { NewsArticle } from "@/types/content";

/**
 * CODÉ EN DUR, TEMPORAIRE : articles complets pour prévisualiser la page de
 * détail (corps, galerie, document joint) sans attendre que le backend
 * héberge plusieurs publications.
 *
 * Reprend les mêmes slugs que les tuiles « article » du bento de
 * `/actualites` (voir `ActualitesPage.tsx`) : cliquer depuis la liste mène
 * donc à une vraie page de détail. À retirer dès que le fil réel couvre
 * plusieurs publications ; voir `recupererActualites` dans `data/source.ts`.
 */
export const DEMO_AESBT_NEWS: NewsArticle[] = [
  {
    id: "demo-jeppc-2026",
    slug: "jeppc-2026",
    title: "JEPPC 2026 : plus de 300 étudiants réunis à l'ambassade du Burkina Faso",
    date: "2026-10-18",
    category: "Vie associative",
    excerpt:
      "Conférences, tables rondes et retrouvailles entre promotions : retour sur une édition record, portée par les commissions culture et citoyenneté.",
    body: [
      "Les Journées d'Engagement Patriotique et de Participation Citoyenne ont réuni cette année plus de trois cents étudiants et stagiaires burkinabè, à l'ambassade du Burkina Faso à Tunis.",
      "Au programme : une conférence sur l'engagement civique à distance, une table ronde avec d'anciens membres du bureau exécutif, et un espace d'échanges entre promotions, de la première année de médecine aux derniers semestres d'ingénierie.",
      "La commission culture a clôturé la journée par une présentation des danses traditionnelles, reprise en choeur par la salle : un rappel que l'identité se porte aussi loin de chez soi.",
    ],
    cover: {
      src: "/aesbt/jeppc-2026.jpg",
      alt: "Rassemblement des étudiants burkinabè à l'ambassade du Burkina Faso",
    },
    gallery: [
      { src: "/picture-3.jpg", alt: "Public lors de la conférence JEPPC 2026" },
      { src: "/picture-7.jpg", alt: "Table ronde avec d'anciens membres du bureau" },
      { src: "/aesbt/staff-groupe.jpg", alt: "Le bureau exécutif à l'ambassade" },
    ],
    attachments: [],
    socialUrl: null,
    status: "publie",
  },
  {
    id: "demo-bourses-ambassade",
    slug: "bourses-ambassade",
    title: "Un nouvel accord avec l'ambassade pour les bourses 2026",
    date: "2026-10-06",
    category: "Partenariat",
    excerpt:
      "L'association et l'ambassade du Burkina Faso signent un protocole pour fluidifier le dépôt et le suivi des dossiers de bourse.",
    body: [
      "Le bureau exécutif de l'AESBT a signé le 2 octobre un protocole de collaboration avec les services de l'ambassade du Burkina Faso à Tunis, pour accompagner le dépôt des dossiers de bourse de la rentrée 2026.",
      "Concrètement, l'association tiendra une permanence mensuelle pour aider les nouveaux arrivants à constituer leur dossier, et l'ambassade s'engage à communiquer un calendrier prévisionnel de traitement.",
      "Un premier bilan sera présenté lors de l'assemblée générale de janvier 2027.",
    ],
    cover: { src: "/aesbt/staff-groupe.jpg", alt: "Le bureau exécutif de l'AESBT" },
    gallery: [],
    attachments: [{ label: "Protocole de collaboration (résumé)", url: null }],
    socialUrl: null,
    status: "publie",
  },
  {
    id: "demo-collecte-rentree",
    slug: "collecte-rentree",
    title: "La collecte de rentrée atteint 80 % de son objectif",
    date: "2026-09-28",
    category: "Solidarité",
    excerpt:
      "Kits scolaires, premiers loyers, billets d'avion : la caisse de solidarité a déjà soutenu douze familles depuis septembre.",
    body: [
      "Lancée le 1er septembre, la collecte de rentrée de la commission solidarité a déjà atteint 80 % de son objectif annuel, grâce aux dons des anciens membres et de quelques entreprises partenaires.",
      "Douze étudiants ont pu être soutenus depuis la rentrée : avance sur le premier loyer, kit de première installation, ou participation au billet d'avion pour les cas les plus urgents.",
      "La collecte reste ouverte jusqu'à la fin du mois de novembre. Le formulaire de demande d'aide est disponible auprès de la commission solidarité.",
    ],
    cover: { src: "/picture-11.jpg", alt: "Remise de kits de rentrée par l'AESBT" },
    gallery: [],
    attachments: [{ label: "Bilan intermédiaire de la collecte", url: null }],
    socialUrl: null,
    status: "publie",
  },
  {
    id: "demo-nouveau-bureau",
    slug: "nouveau-bureau",
    title: "Un nouveau bureau exécutif élu pour 2026-2027",
    date: "2026-10-02",
    category: "Gouvernance",
    excerpt:
      "L'assemblée générale a élu un nouveau bureau exécutif pour deux ans, avec une commission supplémentaire dédiée à l'orientation académique.",
    body: [
      "Réunie le 28 septembre, l'assemblée générale de l'AESBT a élu un nouveau bureau exécutif pour le mandat 2026-2027.",
      "La principale nouveauté : la création d'une commission orientation académique, chargée d'accompagner les étudiants dans le choix de leur filière et leurs démarches d'équivalence.",
      "Le nouveau bureau prendra officiellement ses fonctions le 15 octobre, lors d'une cérémonie de passation ouverte à tous les membres.",
    ],
    cover: { src: "/picture-9.jpg", alt: "Passation du bureau exécutif de l'AESBT" },
    gallery: [],
    attachments: [],
    socialUrl: "https://web.facebook.com/aesbt2",
    status: "publie",
  },
  {
    id: "demo-journee-sportive",
    slug: "journee-sportive",
    title: "La journée sportive inter-promotions revient en décembre",
    date: "2026-09-19",
    category: "Sport",
    excerpt:
      "Football, basketball et tournoi de belote : la commission sport annonce la troisième édition de sa journée inter-promotions.",
    body: [
      "Après le succès des deux premières éditions, la commission sport remet en jeu sa journée inter-promotions, prévue le premier samedi de décembre.",
      "Football à sept, basketball 3x3 et, nouveauté cette année, un tournoi de belote : chaque promotion pourra inscrire une ou plusieurs équipes par discipline.",
      "Les inscriptions ouvriront début novembre auprès des délégués de promotion.",
    ],
    cover: { src: "/picture-5.jpg", alt: "Match de football organisé par l'AESBT" },
    gallery: [],
    attachments: [],
    socialUrl: null,
    status: "publie",
  },
  {
    id: "demo-cafe-des-metiers",
    slug: "cafe-des-metiers",
    title: "Café des métiers : ingénieurs et pharmaciens burkinabè partagent leur parcours",
    date: "2026-09-05",
    category: "Orientation",
    excerpt:
      "Six anciens membres de l'association sont revenus sur leur parcours d'études en Tunisie, de l'inscription à l'entrée dans la vie active.",
    body: [
      "La commission orientation académique a organisé le premier « café des métiers » de l'année, en invitant six anciens membres de l'association à présenter leur parcours.",
      "Ingénierie, pharmacie, médecine : chacun est revenu sur ses choix de filière, ses difficultés d'adaptation et les démarches d'équivalence au retour au pays.",
      "Un deuxième café des métiers, consacré aux filières littéraires et commerciales, est annoncé pour le second semestre.",
    ],
    cover: { src: "/picture-6.jpg", alt: "Échange entre étudiants lors du café des métiers" },
    gallery: [],
    attachments: [],
    socialUrl: null,
    status: "publie",
  },
];
