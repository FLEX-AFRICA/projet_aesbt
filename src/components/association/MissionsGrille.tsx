"use client";

import { EditableListe } from "@/components/editable/Editable";
import type { MissionContenu } from "@/contenus/defauts";

/**
 * Grille des missions, générée depuis la valeur `association.missions`
 * (au lieu de l'ancien `[1, 2, 3].map`).
 *
 * Composant client : `renderItem` est une fonction, qui ne peut pas passer
 * de la page serveur à un composant client. Le texte des éléments est rendu
 * en texte brut. Clé React = index (les missions n'ont pas d'identifiant).
 */
export function MissionsGrille() {
  return (
    <EditableListe<MissionContenu>
      cle="association.missions"
      className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      renderItem={(mission) => (
        <div className="rounded-xl border border-line bg-surface/90 p-6">
          <h3 className="font-display text-lg tracking-tight text-ink">{mission.titre}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-ink">{mission.description}</p>
        </div>
      )}
    />
  );
}
