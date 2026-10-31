"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export const NOTE_MAX = 500;

const BOUTON =
  "inline-flex items-center justify-center rounded-md border border-line px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-40";
const BOUTON_PRINCIPAL =
  "inline-flex items-center justify-center rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:opacity-40";

/** Soumission pour validation : note facultative (500 caractères au plus). */
export function DialogueSoumission({
  enCours,
  enregistrementPrealable,
  erreur,
  onFermer,
  onSoumettre,
}: {
  enCours: boolean;
  /** Des modifications seront enregistrées avant l'envoi. */
  enregistrementPrealable: boolean;
  erreur: string | null;
  onFermer: () => void;
  onSoumettre: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(ouvert) => {
        if (!ouvert && !enCours) onFermer();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle className="font-display text-lg font-semibold text-ink">
          Soumettre pour validation
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug text-muted-ink">
          Un administrateur relira vos modifications avant de les publier.
          {enregistrementPrealable
            ? " Vos modifications en cours seront d'abord enregistrées en brouillon."
            : ""}
        </DialogDescription>
        <div className="grid gap-1.5">
          <label htmlFor="note-soumission" className="text-[13px] font-medium text-ink">
            Note pour l'administrateur (facultative)
          </label>
          <textarea
            id="note-soumission"
            value={note}
            maxLength={NOTE_MAX}
            rows={4}
            disabled={enCours}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-line bg-background px-3 py-2 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          />
          <p className="text-right text-[12px] text-muted-ink">
            {note.length} / {NOTE_MAX} caractères
          </p>
        </div>
        {erreur ? (
          <p role="alert" className="text-[13px] font-medium text-accent-red">
            {erreur}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className={BOUTON} disabled={enCours} onClick={onFermer}>
            Annuler
          </button>
          <button
            type="button"
            className={BOUTON_PRINCIPAL}
            disabled={enCours}
            onClick={() => onSoumettre(note)}
          >
            {enCours ? "Envoi..." : "Soumettre"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
