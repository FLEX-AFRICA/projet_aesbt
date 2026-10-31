/** Statuts d'un contenu éditorial, partagés par tous les écrans standards. */
export type StatutContenu = "brouillon" | "en_attente" | "publie" | "archive";

/** Résultat d'une opération serveur, compatible avec `Resultat` de actions.ts. */
export interface ResultatOperation {
  ok: boolean;
  message?: string;
}

/** Média de la médiathèque tel que proposé au sélecteur. */
export interface MediaChoisissable {
  id: string;
  alt: string;
  /** URL de la vignette, ou null si NEXT_PUBLIC_MEDIA_URL n'est pas renseignée. */
  vignette: string | null;
}
