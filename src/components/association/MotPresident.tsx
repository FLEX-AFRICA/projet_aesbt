"use client";

import { Editable } from "@/components/editable/Editable";
import { useContenu, useUrlImage } from "@/components/editable/ContenusClient";
import { texteDe } from "@/components/editable/contenu";

/**
 * Contenu de la carte « Mot du Président » (le conteneur `CARD` reste dans la
 * page serveur). Composant client car la photo utilise une fonction de rendu.
 */
export function MotPresident() {
  // Résolution d'un identifiant de média (ou chemin public) en URL affichable.
  const src = useUrlImage("association.president.photo");
  const altPortrait = texteDe(
    useContenu("association.president.photo_alt"),
    "Portrait du président de l'AESBT, à venir",
  );

  return (
    <>
      <Editable cle="association.president.etiquette" as="p" className="eyebrow" />

      <Editable
        cle="association.president.photo"
        type="image"
        as="div"
        className="relative mx-auto mt-8 size-36 sm:size-44"
      >
        {() => (
          <>
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-full bg-gradient-to-br from-accent-blue/15 via-transparent to-accent-green/15"
            />
            {src ? (
              <img
                src={src}
                alt={altPortrait}
                className="relative size-full rounded-full object-cover shadow-lg ring-4 ring-surface"
              />
            ) : (
              <div
                role="img"
                aria-label={altPortrait}
                className="relative grid size-full place-items-center rounded-full bg-frost-deep/70 shadow-lg ring-4 ring-surface"
              >
                <Editable
                  cle="association.president.photo_vide"
                  className="px-4 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-muted-ink"
                />
              </div>
            )}
          </>
        )}
      </Editable>

      <svg
        aria-hidden="true"
        viewBox="0 0 32 24"
        className="mx-auto mt-8 h-7 w-9 fill-accent-blue/30"
      >
        <path d="M0 24V13.5C0 6 4.5 1 12 0l1.5 4C8.5 5.5 6 8.5 6 13H12V24H0Zm18 0V13.5C18 6 22.5 1 30 0l1.5 4C26.5 5.5 24 8.5 24 13H30V24H18Z" />
      </svg>

      <Editable
        cle="association.president.message"
        type="texte_long"
        as="blockquote"
        className="mt-5 font-display text-xl leading-snug text-ink text-balance sm:text-2xl"
      />

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-accent-blue" />
        <div>
          <Editable
            cle="association.president.nom"
            as="p"
            repli="Nom à communiquer"
            className="text-sm font-semibold text-ink"
          />
          <Editable
            cle="association.president.role"
            as="p"
            className="text-[13px] text-muted-ink"
          />
        </div>
        <span className="h-px w-8 bg-accent-blue" />
      </div>
    </>
  );
}
