"use client";

import { Ban } from "lucide-react";
import { useState, useTransition } from "react";

import type { Resultat } from "../actions";

/**
 * Action exigeant un motif écrit.
 *
 * Utilisée pour les refus et les rejets. Le motif est obligatoire côté API ;
 * ce composant l'impose aussi à l'interface, et surtout il rappelle à
 * l'administrateur que son texte sera envoyé tel quel à la personne
 * concernée.
 */
export function BoutonMotif({
  action,
  libelle,
  titre,
  aide,
  motifsFrequents = [],
}: {
  action: (motif: string) => Promise<Resultat>;
  libelle: string;
  titre: string;
  aide: string;
  /** Motifs courants, proposés en un clic ; le texte reste modifiable. */
  motifsFrequents?: readonly string[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-50"
      >
        <Ban aria-hidden="true" className="size-3.5" />
        {libelle}
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-lg border border-line bg-surface/60 p-4">
      <p className="text-[13px] font-semibold text-ink">{titre}</p>
      <p className="mt-1 text-[12px] text-muted-ink">{aide}</p>

      {motifsFrequents.length > 0 ? (
        <div className="mt-3">
          <p className="text-[12px] text-muted-ink">Motifs fréquents :</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {motifsFrequents.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMotif(m)}
                className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-soft transition-colors hover:bg-surface"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <textarea
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={3}
        autoFocus
        className="mt-3 w-full rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
        placeholder="Motif communiqué à la personne concernée…"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={enCours || motif.trim().length < 10}
          onClick={() => {
            setErreur(null);
            demarrer(async () => {
              const resultat = await action(motif);
              if (resultat.ok) {
                setOuvert(false);
                setMotif("");
              } else {
                setErreur(resultat.message ?? "Échec de l'opération.");
              }
            });
          }}
          className="rounded-md bg-red-700 px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {enCours ? "…" : "Confirmer"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setErreur(null);
          }}
          className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Annuler
        </button>
        <span className="text-[12px] text-muted-ink">
          {motif.trim().length < 10 ? "10 caractères minimum" : null}
        </span>
      </div>

      {erreur ? (
        <p role="alert" className="mt-2 text-[12px] text-red-700">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
