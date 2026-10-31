"use client";

import type { EvenementOption } from "@/lib/api-admin-galerie";
import { formatDate } from "@/lib/format";

import { ChampFormulaire, classeChamp } from "../_kit";

/** Libellé d'un événement dans une liste déroulante : titre et date de début. */
function libelleEvenement(e: EvenementOption): string {
  return e.debute_le ? `${e.titre} (${formatDate(e.debute_le.slice(0, 10))})` : e.titre;
}

/** Liste déroulante des événements, avec l'option « Aucun ». */
export function ChampEvenement({
  evenements,
  valeur,
  onChange,
  disabled,
}: {
  evenements: readonly EvenementOption[];
  valeur: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
}) {
  // Un événement lié mais absent de la liste (supprimé, liste indisponible) reste sélectionnable.
  const inconnu = valeur !== null && !evenements.some((e) => e.id === valeur);
  return (
    <ChampFormulaire libelle="Événement lié">
      {(p) => (
        <select
          {...p}
          className={classeChamp}
          value={valeur ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        >
          <option value="">Aucun</option>
          {inconnu ? <option value={valeur ?? ""}>Événement actuel</option> : null}
          {evenements.map((e) => (
            <option key={e.id} value={e.id}>
              {libelleEvenement(e)}
            </option>
          ))}
        </select>
      )}
    </ChampFormulaire>
  );
}
