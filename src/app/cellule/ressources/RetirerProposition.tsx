"use client";

import { useState, useTransition } from "react";

import { retirerProposition } from "../actions";

/** Retrait d'une proposition encore en attente de validation. */
export function RetirerProposition({ id }: { id: string }) {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={enCours}
        onClick={() => {
          if (!window.confirm("Retirer cette proposition ?")) return;
          setErreur(null);
          demarrer(async () => {
            const resultat = await retirerProposition(id);
            if (!resultat.ok) setErreur(resultat.message ?? "Opération impossible.");
          });
        }}
        className="shrink-0 rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface disabled:opacity-50"
      >
        {enCours ? "…" : "Retirer"}
      </button>
      {erreur ? (
        <span role="alert" className="text-[12px] text-red-700">
          {erreur}
        </span>
      ) : null}
    </span>
  );
}
