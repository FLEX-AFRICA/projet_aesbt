"use client";

import type { ReactNode } from "react";

import { classeBoutonPrincipal } from "../_kit";

/** Barre au-dessus d'un tableau : filtres éventuels (`children`) et bouton de création. */
export function BarreOutils({
  libelle,
  onClick,
  children,
}: {
  libelle: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button type="button" onClick={onClick} className={classeBoutonPrincipal}>
        {libelle}
      </button>
    </div>
  );
}
