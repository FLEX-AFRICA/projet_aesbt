import type { ReactNode } from "react";

import { ErrorState } from "@/components/ui-aesbt/States";

/**
 * Corps commun des pages de liste : si le chargement a échoué, l'erreur
 * remplace la liste (jamais un tableau vide qui laisserait croire à l'absence
 * de données).
 */
export function PageListe({ erreur, children }: { erreur: string | null; children: ReactNode }) {
  return <div className="mt-8">{erreur ? <ErrorState message={erreur} /> : children}</div>;
}
