/**
 * Libellés lisibles du journal d'audit.
 *
 * Fonctions pures : aucune ne lève d'exception, quelle que soit l'action ou
 * la forme des détails (le journal peut contenir des actions ajoutées plus
 * tard par le backend, ou des détails qui ne sont pas du JSON).
 */

/** Libellé français de chaque action connue du backend. */
export const ACTIONS: Record<string, string> = {
  "compte.valider": "Validation d'une inscription",
  "compte.refuser": "Refus d'une inscription",
  "compte.suspendu": "Suspension d'un compte",
  "compte.valide": "Rétablissement d'un compte",
  "compte.role": "Changement de rôle",
  "compte.amorcage_admin": "Création du premier administrateur",
  "compte.suppression_rgpd": "Suppression d'un compte par son titulaire",
  "mentorat.accepter": "Acceptation d'une demande de mentorat",
  "mentorat.refuser": "Refus d'une demande de mentorat",
  "mentorat.terminee": "Clôture d'une relation de mentorat",
  "mentorat.abandonnee": "Interruption d'une relation de mentorat",
  "mentorat.cloture_administrative": "Clôture d'une relation par le bureau",
  "signalement.creer": "Signalement envoyé",
  "signalement.en_cours": "Signalement pris en charge",
  "signalement.traite": "Signalement traité",
  "signalement.rejete": "Signalement rejeté",
  "ressource.proposer": "Proposition d'une ressource",
  "ressource.creer": "Création d'une ressource",
  "ressource.creer_et_publier": "Création et publication d'une ressource",
  "ressource.publier": "Publication d'une ressource",
  "ressource.rejeter": "Rejet d'une ressource",
  "ressource.modifier": "Modification d'une ressource",
  "ressource.depublier": "Dépublication d'une ressource",
  "ressource.supprimer": "Suppression d'une ressource",
  "publication.creer": "Création d'un contenu",
  "publication.creer_et_publier": "Création et publication d'un contenu",
  "publication.modifier": "Modification d'un contenu",
  "publication.publier": "Publication d'un contenu",
  "publication.archiver": "Archivage d'un contenu",
  "publication.supprimer": "Suppression d'un contenu",
  "temoignage.soumettre": "Soumission d'un témoignage",
  "temoignage.retirer": "Retrait d'un témoignage",
  "media.televerser": "Ajout d'un média",
  "media.supprimer": "Suppression d'un média",
  "parametres.modifier": "Modification des paramètres du site",
  "referentiel.filiere.creer": "Création d'une filière",
  "contenu.brouillon": "Enregistrement d'un brouillon de page",
  "contenu.soumettre": "Soumission de modifications pour validation",
  "contenu.publier": "Publication de modifications de page",
  "contenu.rejeter": "Rejet de modifications de page",
  "contenu.restaurer": "Restauration d'une version de page",
  "album.creer": "Création d'un album",
  "album.modifier": "Modification d'un album",
  "album.photos": "Modification des photos d'un album",
  "album.publier": "Publication d'un album",
  "album.archiver": "Archivage d'un album",
  "album.depublier": "Dépublication d'un album",
  "album.supprimer": "Suppression d'un album",
  "evenement.creer": "Création d'un événement",
  "evenement.modifier": "Modification d'un événement",
  "evenement.publier": "Publication d'un événement",
  "evenement.archiver": "Archivage d'un événement",
  "evenement.depublier": "Dépublication d'un événement",
  "evenement.supprimer": "Suppression d'un événement",
  "membre.creer": "Ajout d'un membre",
  "membre.modifier": "Modification d'un membre",
  "membre.supprimer": "Suppression d'un membre",
  "statistique.modifier": "Modification d'un chiffre clé",
  "document.creer": "Ajout d'un document institutionnel",
  "document.modifier": "Modification d'un document institutionnel",
  "document.supprimer": "Suppression d'un document institutionnel",
};

/** Libellé d'une action ; une action inconnue s'affiche telle quelle. */
export function libelleAction(action: string): string {
  return ACTIONS[action] ?? action;
}

const ROLES: Record<string, string> = {
  etudiant: "Étudiant",
  mentor: "Mentor",
  editeur: "Éditeur",
  admin: "Administrateur",
};

const TYPES_CIBLE: Record<string, string> = {
  contenu_page: "Page",
  album: "Album",
  evenement: "Événement",
  membre: "Membre",
  statistique: "Statistique",
  document: "Document",
  profil: "Compte",
  publication: "Contenu",
  ressource: "Ressource",
  media: "Média",
};

/** Cible d'une action : « Page : accueil », « Album : a1 », ou null sans cible. */
export function libelleCible(type: string | null, id: string | null): string | null {
  if (!type && !id) return null;
  const nom = type ? (TYPES_CIBLE[type] ?? type) : null;
  if (nom && id) return `${nom} : ${id}`;
  return nom ?? id;
}

const CLES_DETAIL: Record<string, string> = {
  cles: "Champs",
  cle: "Champ",
  depuis_version: "Depuis la version",
  mise_a_jour: "Mise à jour",
  role: "Rôle",
  motif: "Motif",
};

function texteValeur(cle: string, valeur: unknown): string {
  if (Array.isArray(valeur)) return valeur.map((v) => texteValeur(cle, v)).join(", ");
  if (valeur === null || valeur === undefined) return "aucun";
  if (typeof valeur === "boolean") return valeur ? "oui" : "non";
  if (cle === "role" && typeof valeur === "string") return ROLES[valeur] ?? valeur;
  if (typeof valeur === "object") return JSON.stringify(valeur);
  return String(valeur);
}

/** Détails lisibles d'une entrée ; le texte brut est conservé s'il n'est pas du JSON objet. */
export function detailLisible(details: string | null): string | null {
  if (!details) return null;
  try {
    const objet: unknown = JSON.parse(details);
    if (objet === null || typeof objet !== "object" || Array.isArray(objet)) return details;
    return Object.entries(objet)
      .map(([cle, valeur]) => `${CLES_DETAIL[cle] ?? cle} : ${texteValeur(cle, valeur)}`)
      .join(", ");
  } catch {
    return details;
  }
}
