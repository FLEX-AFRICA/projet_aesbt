"use client";

import { useEffect, useMemo } from "react";

import { grouperChamps } from "../_lib/champs";
import type { ChampEditeur, MediaEditeur, ValeurContenu, Valeurs } from "../_lib/types";
import type { ErreursChamp } from "../_lib/validation";
import { ChampListe } from "./ChampListe";
import { ChampScalaire } from "./ChampScalaire";

/** Une valeur de liste dans un champ scalaire (donnée incohérente) est ignorée. */
function valeurScalaire(v: ValeurContenu | undefined): string | number | null | undefined {
  return Array.isArray(v) ? null : v;
}

/** Identifiant DOM de la zone d'un champ (cible du défilement). */
export function idZoneChamp(cle: string): string {
  return `champ-${cle}`;
}

/**
 * Panneau latéral : champs groupés, zone sélectionnée dans l'aperçu mise en
 * avant et amenée dans le champ de vision.
 */
export function PanneauEdition({
  champs,
  valeurs,
  modifiees,
  cleSelectionnee,
  erreurs,
  medias,
  onChange,
}: {
  champs: readonly ChampEditeur[];
  /** Valeurs courantes (base + modifications). */
  valeurs: Valeurs;
  /** Clés ayant une modification non enregistrée. */
  modifiees: ReadonlySet<string>;
  cleSelectionnee: string | null;
  erreurs: Record<string, ErreursChamp>;
  medias: readonly MediaEditeur[];
  onChange: (cle: string, valeur: ValeurContenu) => void;
}) {
  const groupes = useMemo(() => grouperChamps(champs), [champs]);

  useEffect(() => {
    if (!cleSelectionnee) return;
    const zone = document.getElementById(idZoneChamp(cleSelectionnee));
    if (!zone) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zone.scrollIntoView({ block: "nearest", behavior: reduit ? "auto" : "smooth" });
  }, [cleSelectionnee]);

  if (champs.length === 0) {
    return <p className="p-4 text-[14px] text-muted-ink">Cette page n'a aucun champ éditable.</p>;
  }

  return (
    <div className="grid gap-6 p-4">
      {groupes.map(({ groupe, champs: liste }) => (
        <section key={groupe} aria-label={groupe} className="grid gap-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-ink">
            {groupe}
          </h2>
          {liste.map((champ) => {
            const selectionne = champ.cle === cleSelectionnee;
            const erreursChamp = erreurs[champ.cle] ?? {};
            return (
              <div
                key={champ.cle}
                id={idZoneChamp(champ.cle)}
                {...(selectionne ? { "aria-current": "true" as const } : {})}
                className={
                  selectionne
                    ? "rounded-lg p-2 ring-2 ring-accent-blue"
                    : "rounded-lg p-2 ring-1 ring-transparent"
                }
              >
                {selectionne || modifiees.has(champ.cle) ? (
                  <p className="mb-2 flex gap-2 text-[11px] font-semibold uppercase tracking-wide">
                    {selectionne ? (
                      <span className="text-accent-blue">Zone sélectionnée</span>
                    ) : null}
                    {modifiees.has(champ.cle) ? (
                      <span className="text-muted-ink">Modifié</span>
                    ) : null}
                  </p>
                ) : null}
                {champ.type === "liste" ? (
                  <ChampListe
                    champ={champ}
                    valeur={valeurs[champ.cle]}
                    erreurs={erreursChamp}
                    medias={medias}
                    onChange={(v) => onChange(champ.cle, v)}
                  />
                ) : (
                  <ChampScalaire
                    type={champ.type}
                    libelle={champ.libelle}
                    valeur={valeurScalaire(valeurs[champ.cle])}
                    max={champ.max}
                    erreur={erreursChamp[""] ?? null}
                    medias={medias}
                    onChange={(v) => onChange(champ.cle, v)}
                  />
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
