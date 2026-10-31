import type { NomIcone } from "./icones";

/** Un lien de la navigation d'un espace. L'icône est désignée par son nom (voir `icones.ts`). */
export interface LienEspace {
  href: string;
  libelle: string;
  icone: NomIcone;
  /** Actif uniquement sur l'URL exacte (sinon actif aussi sur les sous-pages). */
  exact?: boolean;
}

/** Teintes disponibles, issues de la palette du site. */
export type CouleurGroupe = "rouge" | "vert" | "or" | "encre";

/** Une catégorie de liens, avec son titre de groupe. */
export interface GroupeEspace {
  titre: string;
  /** Teinte du groupe : repère de catégorie et couleur du lien actif. Rouge par défaut. */
  couleur?: CouleurGroupe;
  liens: LienEspace[];
}

/** Lien de bascule vers un autre espace (admin <-> cellule). */
export interface BasculeEspace {
  href: string;
  libelle: string;
  icone: NomIcone;
}

/**
 * Configuration déclarative d'un espace. Entièrement sérialisable : elle peut
 * être construite dans un composant serveur et passée à `ShellEspace`.
 */
export interface ConfigEspace {
  /** Nom de l'espace affiché en en-tête (« Administration »). */
  nom: string;
  /** Libellé accessible de la navigation. */
  libelleNavigation: string;
  /** Destination du logo. Par défaut « / ». */
  logoHref?: string;
  groupes: GroupeEspace[];
  bascule?: BasculeEspace;
  /** Page complète des notifications. Par défaut déduite de l'espace courant. */
  notificationsHref?: string;
}

/** Utilisateur affiché dans le bloc du bas de la barre latérale. */
export interface UtilisateurEspace {
  nom?: string | null;
  email: string;
  /** Libellé lisible du rôle (« Administrateur »). */
  roleLibelle: string;
}
