"use client";

import { EditableListe } from "@/components/editable/Editable";

/** Élément de `association.historique.paragraphes`. */
interface Paragraphe extends Record<string, string | number | null> {
  texte: string;
}

/**
 * Paragraphes de l'historique, générés depuis la valeur de la liste.
 *
 * Composant client : `renderItem` est une fonction, qui ne peut pas passer de
 * la page serveur à un composant client. Les `p` restent enfants directs du
 * conteneur (même structure et même `space-y-4` qu'avant).
 */
export function HistoriqueParagraphes() {
  return (
    <EditableListe<Paragraphe>
      cle="association.historique.paragraphes"
      className="space-y-4 text-[15px] leading-relaxed text-muted-ink md:col-span-8"
      renderItem={(paragraphe) => <p>{paragraphe.texte}</p>}
    />
  );
}
