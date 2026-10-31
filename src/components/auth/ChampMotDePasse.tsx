"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

import { ChampVerre } from "./ChampVerre";
import { CLASSE_ENTREE } from "./styles";

type Props = {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  valeur?: string;
  onChange?: (valeur: string) => void;
  /** Identifiant d'un élément décrivant la règle du champ. */
  decritPar?: string;
};

/** Champ mot de passe avec bouton afficher / masquer. */
export function ChampMotDePasse({
  label,
  name,
  autoComplete,
  minLength,
  valeur,
  onChange,
  decritPar,
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icone = visible ? EyeOff : Eye;

  return (
    <ChampVerre htmlFor={id} label={label}>
      <input
        id={id}
        required
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        {...(minLength ? { minLength } : {})}
        {...(decritPar ? { "aria-describedby": decritPar } : {})}
        {...(valeur !== undefined ? { value: valeur } : {})}
        {...(onChange ? { onChange: (e) => onChange(e.target.value) } : {})}
        className={`${CLASSE_ENTREE} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-2xl text-muted-ink hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-blue"
      >
        <Icone aria-hidden className="size-[18px]" />
      </button>
    </ChampVerre>
  );
}
