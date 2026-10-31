"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import {
  ajouter,
  deplacer,
  elementVide,
  modifierSousChamp,
  supprimer,
  type ElementListe,
} from "../_lib/liste";
import type { ChampEditeur, MediaEditeur, ValeurContenu } from "../_lib/types";
import type { ErreursChamp } from "../_lib/validation";
import { ChampScalaire } from "./ChampScalaire";

const BOUTON_ICONE =
  "grid size-8 place-items-center rounded-md border border-line text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-40";

/** Éditeur d'une liste répétable : ajout, suppression, déplacement, sous-champs. */
export function ChampListe({
  champ,
  valeur,
  erreurs,
  medias,
  onChange,
}: {
  champ: ChampEditeur;
  valeur: ValeurContenu | undefined;
  erreurs: ErreursChamp;
  medias: readonly MediaEditeur[];
  onChange: (valeur: ValeurContenu) => void;
}) {
  const elements: ElementListe[] = Array.isArray(valeur) ? valeur : [];
  const sousChamps = champ.sousChamps ?? [];
  const max = champ.max ?? 50;
  const plein = elements.length >= max;

  return (
    <fieldset className="grid gap-3 rounded-lg border border-line p-3">
      <legend className="px-1 text-[13px] font-medium text-ink">{champ.libelle}</legend>
      {erreurs[""] ? (
        <p role="alert" className="text-[12px] font-medium text-accent-red">
          {erreurs[""]}
        </p>
      ) : null}

      {elements.length === 0 ? (
        <p className="text-[13px] text-muted-ink">Aucun élément.</p>
      ) : (
        <ol className="grid gap-3">
          {elements.map((element, index) => (
            <li
              // Aucun identifiant dans les valeurs : l'index sert de clé (comme <EditableListe>).
              key={index}
              className="grid gap-3 rounded-md border border-line bg-surface/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-ink">Élément {index + 1}</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className={BOUTON_ICONE}
                    aria-label={`Monter l'élément ${index + 1}`}
                    disabled={index === 0}
                    onClick={() => onChange(deplacer(elements, index, -1))}
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={BOUTON_ICONE}
                    aria-label={`Descendre l'élément ${index + 1}`}
                    disabled={index === elements.length - 1}
                    onClick={() => onChange(deplacer(elements, index, 1))}
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={`${BOUTON_ICONE} text-red-700`}
                    aria-label={`Supprimer l'élément ${index + 1}`}
                    onClick={() => onChange(supprimer(elements, index))}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
              {sousChamps.map((sous) => (
                <ChampScalaire
                  key={sous.nom}
                  type={sous.type}
                  libelle={sous.libelle}
                  valeur={element[sous.nom]}
                  max={sous.max}
                  erreur={erreurs[`${index}.${sous.nom}`] ?? null}
                  medias={medias}
                  onChange={(v) => onChange(modifierSousChamp(elements, index, sous.nom, v))}
                />
              ))}
            </li>
          ))}
        </ol>
      )}

      {sousChamps.length === 0 ? (
        <p className="text-[12px] text-muted-ink">
          Structure des éléments inconnue : ajout impossible tant que la liste est vide.
        </p>
      ) : (
        <button
          type="button"
          disabled={plein}
          onClick={() => onChange(ajouter(elements, elementVide(sousChamps)))}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-line px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-50"
        >
          <Plus aria-hidden="true" className="size-4" />
          {plein ? `Maximum atteint (${max})` : "Ajouter un élément"}
        </button>
      )}
    </fieldset>
  );
}
