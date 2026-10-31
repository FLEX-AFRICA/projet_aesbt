import type { BureauMember, InstitutionalDocument, Statistic } from "@/types/content";

/**
 * Structures institutionnelles.
 * Toutes les valeurs sont des emplacements : aucun nom, chiffre ou document
 * réel n'est inventé. À compléter avec les informations officielles.
 */

export const STATISTICS: Statistic[] = [
  { id: "creation", label: "Année de création", value: null },
  { id: "membres", label: "Membres", value: null },
  { id: "evenements", label: "Événements organisés", value: null },
  { id: "partenaires", label: "Partenaires", value: null },
];

export const PRESIDENT_MESSAGE = {
  /** TODO : nom du président communiqué par l'association. */
  name: null as string | null,
  role: "Président de l'AESBT",
  photo: { src: null as string | null, alt: "Portrait du président de l'AESBT — à venir" },
  /** TODO : message officiel. */
  message:
    "[Emplacement réservé au mot du Président. Le texte officiel sera fourni par le Bureau Exécutif.]",
};

export const BUREAU_MEMBERS: BureauMember[] = [
  {
    id: "president",
    name: null,
    role: "Président",
    photo: { src: null, alt: "Portrait — à venir" },
  },
  {
    id: "vice-president",
    name: null,
    role: "Vice-président",
    photo: { src: null, alt: "Portrait — à venir" },
  },
  {
    id: "secretaire-general",
    name: null,
    role: "Secrétaire général",
    photo: { src: null, alt: "Portrait — à venir" },
  },
  {
    id: "tresorier",
    name: null,
    role: "Trésorier",
    photo: { src: null, alt: "Portrait — à venir" },
  },
  {
    id: "charge-communication",
    name: null,
    role: "Chargé de la communication",
    photo: { src: null, alt: "Portrait — à venir" },
  },
  {
    id: "charge-social",
    name: null,
    role: "Chargé des affaires sociales",
    photo: { src: null, alt: "Portrait — à venir" },
  },
];

export const INSTITUTIONAL_DOCUMENTS: InstitutionalDocument[] = [
  {
    id: "statuts",
    title: "Statuts de l'association",
    description: "Document institutionnel — à mettre en ligne.",
    file: { label: "Statuts", url: null },
  },
  {
    id: "reglement",
    title: "Règlement intérieur",
    description: "Document institutionnel — à mettre en ligne.",
    file: { label: "Règlement intérieur", url: null },
  },
  {
    id: "organigramme",
    title: "Organigramme",
    description: "Document institutionnel — à mettre en ligne.",
    file: { label: "Organigramme", url: null },
  },
];
