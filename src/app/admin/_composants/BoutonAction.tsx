"use client";

import { useState, useTransition, type ReactNode } from "react";

import type { Resultat } from "../actions";

/**
 * Bouton déclenchant une action serveur.
 *
 * Trois comportements qui évitent les erreurs d'exploitation courantes :
 * l'état d'attente empêche le double clic, l'échec s'affiche à côté du bouton
 * plutôt que de disparaître, et une confirmation peut être exigée pour les
 * actions irréversibles.
 */
export function BoutonAction({
  action,
  children,
  confirmation,
  variante = "neutre",
  icone,
}: {
  action: () => Promise<Resultat>;
  children: ReactNode;
  confirmation?: string;
  variante?: "principal" | "danger" | "neutre";
  /**
   * Icône décorative affichée avant le libellé, passée comme élément
   * (`<Ban />`) : un composant ne peut pas traverser la frontière serveur/client.
   */
  icone?: ReactNode;
}) {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  const classes = {
    principal: "bg-accent-blue text-primary-foreground hover:opacity-90",
    danger: "border border-red-300 text-red-700 hover:bg-red-50",
    neutre: "border border-line text-ink hover:bg-surface",
  }[variante];

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={enCours}
        onClick={() => {
          if (confirmation && !window.confirm(confirmation)) return;
          setErreur(null);
          demarrer(async () => {
            const resultat = await action();
            if (!resultat.ok) setErreur(resultat.message ?? "Échec de l'opération.");
          });
        }}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-50 ${classes}`}
      >
        {icone && !enCours ? (
          <span
            aria-hidden="true"
            className="inline-flex size-3.5 items-center justify-center [&>svg]:size-3.5"
          >
            {icone}
          </span>
        ) : null}
        {enCours ? "…" : children}
      </button>
      {erreur ? (
        <span role="alert" className="text-[12px] text-red-700">
          {erreur}
        </span>
      ) : null}
    </span>
  );
}
