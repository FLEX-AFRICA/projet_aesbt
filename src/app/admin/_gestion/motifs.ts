/** Motifs de refus ou de rejet courants (10 caractères minimum, exigés par l'API). */
export const MOTIFS_REFUS_COMPTE = [
  "Les informations fournies ne permettent pas de vérifier votre identité.",
  "Vous ne semblez pas rattaché(e) à une filière couverte par l'AESBT.",
  "Un compte existe déjà à votre nom.",
] as const;

export const MOTIFS_REJET_RESSOURCE = [
  "Le lien est inaccessible ou ne correspond pas à la description.",
  "Cette ressource existe déjà sur la plateforme.",
  "Le contenu ne correspond pas à la vocation de la plateforme.",
] as const;
