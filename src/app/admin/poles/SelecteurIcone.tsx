"use client";

import { Check } from "lucide-react";
import { useId } from "react";

import { iconePole } from "@/components/poles/icones-poles";
import { cn } from "@/lib/utils";

/** Icônes proposées si l'API n'a pas pu fournir sa liste. */
export const ICONES_PAR_DEFAUT = [
  { cle: "batiment", libelle: "Bâtiment et travaux" },
  { cle: "industriel", libelle: "Industrie" },
  { cle: "sante", libelle: "Santé" },
  { cle: "economie", libelle: "Économie et gestion" },
  { cle: "data", libelle: "Data et IA" },
  { cle: "sciences", libelle: "Sciences" },
] as const;

/**
 * Choix de l'icône d'un pôle : groupe de boutons radio présentés en pastilles
 * avec leur libellé. Navigable au clavier (flèches) grâce aux radios natifs.
 */
export function SelecteurIcone({
  valeur,
  onChange,
  icones,
  desactive = false,
}: {
  valeur: string;
  onChange: (cle: string) => void;
  icones: readonly { cle: string; libelle: string }[];
  desactive?: boolean;
}) {
  const nom = useId();
  return (
    <fieldset className="grid gap-2" disabled={desactive}>
      <legend className="mb-1 text-[13px] font-medium text-ink">Icône</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {icones.map((i) => {
          const Icone = iconePole(i.cle);
          const choisi = valeur === i.cle;
          return (
            <label
              key={i.cle}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border bg-white px-2 py-3 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2E7D4F]",
                choisi ? "border-[#2E7D4F] bg-[#2E7D4F]/5" : "border-line hover:bg-surface",
                desactive && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={nom}
                value={i.cle}
                checked={choisi}
                onChange={() => onChange(i.cle)}
                className="sr-only"
              />
              <span className="grid size-10 place-items-center rounded-xl bg-[#2E7D4F]/10 text-[#2E7D4F]">
                <Icone aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </span>
              <span className="text-[12px] font-medium leading-tight text-ink">{i.libelle}</span>
              {choisi ? (
                <Check
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 size-3.5 text-[#2E7D4F]"
                  strokeWidth={2.5}
                />
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
