"use client";

import { SelecteurMedia, type MediaChoisissable } from "../_kit";

/**
 * Champ d'image (couverture, photo, fichier) commun à tous les formulaires :
 * même libellé d'aide et même message quand la galerie est vide ou
 * indisponible.
 */
export function ChampCouverture({
  libelle = "Image de couverture",
  medias,
  valeur,
  onChange,
  disabled,
  aide = "Image choisie dans la galerie. Optionnelle.",
}: {
  libelle?: string;
  medias: readonly MediaChoisissable[];
  valeur: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  aide?: string;
}) {
  return (
    <SelecteurMedia
      libelle={libelle}
      medias={medias}
      valeur={valeur}
      onChange={onChange}
      aide={aide}
      {...(disabled !== undefined ? { disabled } : {})}
      messageVide="La galerie est vide ou indisponible. Ajoutez des images depuis la page Galerie."
    />
  );
}
