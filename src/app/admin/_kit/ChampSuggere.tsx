"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { classeChamp } from "./TiroirFormulaire";

/** Minuscules sans accents, pour un filtrage tolérant. */
function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

interface ChampSuggereProps {
  value: string;
  onChange: (valeur: string) => void;
  /** Suggestions en tableau. Prioritaire sur `useSuggestions`. */
  suggestions?: readonly string[] | undefined;
  /** Alternative : hook fournissant les suggestions (appelé à chaque rendu). */
  useSuggestions?: (() => readonly string[]) | undefined;
  placeholder?: string | undefined;
  id?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  maxLength?: number | undefined;
  "aria-invalid"?: boolean | "true" | "false" | undefined;
  "aria-describedby"?: string | undefined;
  className?: string | undefined;
}

/**
 * Champ texte avec suggestions. La valeur libre reste toujours permise : la
 * liste aide, elle ne contraint pas. Motif ARIA « combobox » avec liste.
 *
 * Clavier : flèches haut et bas pour parcourir, Entrée pour choisir la
 * suggestion active, Échap pour fermer. Sans suggestion active, Entrée garde
 * son comportement habituel (validation du formulaire).
 */
export function ChampSuggere({
  value,
  onChange,
  suggestions,
  useSuggestions,
  placeholder,
  id,
  required,
  disabled,
  maxLength,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  className,
}: ChampSuggereProps) {
  // Le hook est appelé inconditionnellement pour respecter les règles des hooks.
  const depuisHook = useSuggestions?.();
  const source = suggestions ?? depuisHook ?? [];

  const idGenere = useId();
  const idListe = `${idGenere}-liste`;
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const racine = useRef<HTMLDivElement>(null);

  const filtrees = (() => {
    const requete = normaliser(value);
    const uniques = [...new Set(source)];
    const trouvees = requete ? uniques.filter((s) => normaliser(s).includes(requete)) : uniques;
    // Une seule suggestion identique à la saisie n'apporte rien.
    return trouvees.length === 1 && trouvees[0] === value ? [] : trouvees.slice(0, 8);
  })();

  const affichee = ouvert && !disabled && filtrees.length > 0;
  const idOption = (i: number) => `${idListe}-${i}`;

  const choisir = (valeur: string) => {
    onChange(valeur);
    setOuvert(false);
    setActif(-1);
  };

  const surTouche = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (filtrees.length === 0) return;
      e.preventDefault();
      if (!affichee) {
        setOuvert(true);
        setActif(e.key === "ArrowDown" ? 0 : filtrees.length - 1);
        return;
      }
      const sens = e.key === "ArrowDown" ? 1 : -1;
      setActif((i) => (i + sens + filtrees.length) % filtrees.length);
    } else if (e.key === "Enter" && affichee && actif >= 0) {
      e.preventDefault();
      const choix = filtrees[actif];
      if (choix !== undefined) choisir(choix);
    } else if (e.key === "Escape" && affichee) {
      // Ne referme pas le tiroir parent : seule la liste se ferme.
      e.preventDefault();
      e.stopPropagation();
      setOuvert(false);
      setActif(-1);
    }
  };

  return (
    <div
      ref={racine}
      className="relative"
      onBlur={(e) => {
        if (!racine.current?.contains(e.relatedTarget)) {
          setOuvert(false);
          setActif(-1);
        }
      }}
    >
      <input
        type="text"
        role="combobox"
        aria-expanded={affichee}
        aria-controls={idListe}
        aria-autocomplete="list"
        aria-activedescendant={affichee && actif >= 0 ? idOption(actif) : undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        autoComplete="off"
        id={id}
        value={value}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(classeChamp, className)}
        onChange={(e) => {
          onChange(e.target.value);
          setOuvert(true);
          setActif(-1);
        }}
        onFocus={() => setOuvert(true)}
        onClick={() => setOuvert(true)}
        onKeyDown={surTouche}
      />
      <ul
        id={idListe}
        role="listbox"
        hidden={!affichee}
        className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border border-line bg-popover py-1 text-popover-foreground shadow-md"
      >
        {filtrees.map((s, i) => (
          <li
            key={s}
            id={idOption(i)}
            role="option"
            aria-selected={i === actif}
            // mouseDown plutôt que click : évite la perte de focus avant le choix.
            onMouseDown={(e) => {
              e.preventDefault();
              choisir(s);
            }}
            onMouseEnter={() => setActif(i)}
            className={cn(
              "cursor-pointer px-3 py-1.5 text-[14px] text-ink",
              i === actif && "bg-surface",
            )}
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
