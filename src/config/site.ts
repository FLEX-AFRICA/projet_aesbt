/**
 * Configuration centrale du site AESBT.
 *
 * Les valeurs marquées TODO sont des emplacements : elles doivent être
 * remplacées par les informations officielles fournies par l'association.
 * Ne pas inventer de coordonnées, de réseaux sociaux ni de chiffres.
 */

export const SITE = {
  shortName: "AESBT",
  name: "AESBT — Association des Étudiants et Stagiaires Burkinabè en Tunisie",
  longName: "Association des Étudiants et Stagiaires Burkinabè en Tunisie",
  description:
    "Site officiel de l'AESBT, association des étudiants et stagiaires burkinabè en Tunisie : association, actualités, galerie, centre de ressources, événements et contact.",
  locale: "fr_FR",
} as const;

/** Coordonnées officielles — à compléter (aucune donnée inventée). */
export const CONTACT = {
  email: null as string | null, // TODO: e-mail officiel AESBT
  phone: null as string | null, // TODO: téléphone officiel AESBT
  address: null as string | null, // TODO: adresse / localisation officielle
} as const;

export type SocialLink = {
  label: string;
  /** null tant que le lien officiel n'a pas été communiqué. */
  href: string | null;
};

/** Réseaux sociaux officiels de l'association. */
export const SOCIALS: SocialLink[] = [
  { label: "Facebook", href: "https://web.facebook.com/aesbt2" },
  { label: "Instagram", href: null },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/association-des-%C3%A9tudiants-et-stagiaires-burkinab%C3%A9s-en-tunisie/home/",
  },
  { label: "TikTok", href: "https://www.tiktok.com/@aesbt.peopols" },
];

export type NavItem = {
  label: string;
  to: string;
};

export const MAIN_NAV: NavItem[] = [
  { label: "Accueil", to: "/" },
  { label: "Association", to: "/association" },
  { label: "Actualités", to: "/actualites" },
  { label: "Galerie", to: "/galerie" },
  { label: "Ressources", to: "/ressources" },
  { label: "Événements", to: "/evenements" },
  { label: "Contact", to: "/contact" },
];

/**
 * Point d'intégration FLEXHUB.
 *
 * FLEXHUB n'est PAS connecté. Lorsque l'intégration sera effectuée :
 * - `registrationUrl` n'est plus utilisé : l'inscription se fait sur la page interne ;
 * - brancher les événements via src/data/events.ts.
 */
export const FLEXHUB = {
  connected: false,
  /** URL externe d'inscription FLEXHUB — à renseigner. */
  registrationUrl: null as string | null,
} as const;

/** Page d'inscription interne (formulaire relié à l'API). */
export const REGISTRATION_ROUTE = "/inscription";
