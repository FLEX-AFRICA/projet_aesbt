"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { MediaReference, Soumission } from "../_lib/detail";
import type { ChangementCle } from "../_lib/diff";
import { DiffValeur } from "./DiffValeur";

export type IntentionDiff = "publier" | "rejeter";

const BOUTON =
  "inline-flex items-center justify-center rounded-md border border-line px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-40";
const BOUTON_PRINCIPAL =
  "inline-flex items-center justify-center rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:opacity-40";
const BOUTON_DANGER =
  "inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-40";

/**
 * Écran « avant / après » des brouillons d'une page : publier ou rejeter tout
 * ou une sélection de clés, avec confirmation. Rendu seulement quand il est
 * ouvert (le parent le remonte à chaque ouverture : la sélection repart de
 * « tout »).
 */
export function EcranDiff({
  intention,
  changements,
  medias,
  soumission,
  enCours,
  erreur,
  onFermer,
  onPublier,
  onRejeter,
}: {
  intention: IntentionDiff;
  changements: readonly ChangementCle[];
  medias: Record<string, MediaReference>;
  soumission: Soumission | null;
  enCours: boolean;
  erreur: string | null;
  onFermer: () => void;
  onPublier: (cles: string[]) => void;
  onRejeter: (cles: string[]) => void;
}) {
  const [selection, setSelection] = useState<Set<string>>(
    () => new Set(changements.map((c) => c.cle)),
  );
  const [confirmation, setConfirmation] = useState<IntentionDiff | null>(null);
  const toutesRef = useRef<HTMLInputElement>(null);

  const total = changements.length;
  const nb = selection.size;
  const cles = useMemo(
    () => changements.map((c) => c.cle).filter((c) => selection.has(c)),
    [changements, selection],
  );

  useEffect(() => {
    if (toutesRef.current) toutesRef.current.indeterminate = nb > 0 && nb < total;
  }, [nb, total]);

  // Une erreur serveur ramène à l'écran de choix, pour corriger ou réessayer.
  useEffect(() => {
    if (erreur) setConfirmation(null);
  }, [erreur]);

  function basculer(cle: string, coche: boolean): void {
    setSelection((prev) => {
      const suivante = new Set(prev);
      if (coche) suivante.add(cle);
      else suivante.delete(cle);
      return suivante;
    });
  }

  const publier = intention === "publier";
  const mot = nb > 1 ? "modifications" : "modification";

  return (
    <Dialog
      open
      onOpenChange={(ouvert) => {
        if (!ouvert && !enCours) onFermer();
      }}
    >
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="border-b border-line px-5 py-4 pr-12">
          <DialogTitle className="font-display text-lg font-semibold text-ink">
            {publier ? "Publier les modifications" : "Rejeter le brouillon"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] leading-snug text-muted-ink">
            {publier
              ? "Relisez chaque changement : la version « avant » est celle du site aujourd'hui, la version « après » sera visible par tous une fois publiée."
              : "Rejeter supprime le brouillon des champs cochés : ils reviennent à la version publiée. Cette action est définitive."}
          </DialogDescription>
          {soumission ? (
            <p className="mt-2 rounded-md bg-accent-blue/10 px-3 py-2 text-[13px] text-ink">
              Soumis pour validation par <strong>{soumission.soumisParNom ?? "un éditeur"}</strong>{" "}
              le {formatDate(soumission.soumisLe)}
              {soumission.note ? ` : « ${soumission.note} »` : "."}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {total === 0 ? (
            <p className="py-8 text-center text-[14px] text-muted-ink">
              Aucun brouillon en attente sur cette page.
            </p>
          ) : (
            <>
              <label className="mb-4 flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-ink">
                <input
                  ref={toutesRef}
                  type="checkbox"
                  className="size-4 accent-[var(--color-accent-blue)]"
                  checked={nb === total}
                  disabled={enCours}
                  onChange={(e) =>
                    setSelection(
                      e.target.checked ? new Set(changements.map((c) => c.cle)) : new Set(),
                    )
                  }
                />
                Tout sélectionner ({nb} sur {total})
              </label>
              <ul className="grid gap-4">
                {changements.map((c) => (
                  <li
                    key={c.cle}
                    className={cn(
                      "rounded-xl border p-3 sm:p-4",
                      selection.has(c.cle) ? "border-accent-blue/40" : "border-line opacity-70",
                    )}
                  >
                    <label className="mb-3 flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent-blue)]"
                        checked={selection.has(c.cle)}
                        disabled={enCours}
                        onChange={(e) => basculer(c.cle, e.target.checked)}
                      />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold text-ink">
                          {c.libelle}
                        </span>
                        <span className="block break-all text-[11px] text-muted-ink">{c.cle}</span>
                      </span>
                    </label>
                    {c.identique ? (
                      <p className="text-[13px] text-muted-ink">
                        Le brouillon est identique à la version actuelle : le publier ou le rejeter
                        ne change rien sur le site.
                      </p>
                    ) : (
                      <DiffValeur
                        type={c.type}
                        avant={c.avant}
                        apres={c.apres}
                        sousChamps={c.sousChamps}
                        medias={medias}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="border-t border-line bg-surface/60 px-5 py-3">
          {erreur ? (
            <p role="alert" className="mb-2 text-[13px] font-medium text-accent-red">
              {erreur}
            </p>
          ) : null}
          {confirmation ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="alert" className="text-[13px] font-medium text-ink">
                {confirmation === "publier"
                  ? `Publier ${nb} ${mot} sur le site public ?`
                  : `Rejeter ${nb} ${mot} ? Les brouillons seront supprimés.`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={BOUTON}
                  disabled={enCours}
                  onClick={() => setConfirmation(null)}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className={confirmation === "publier" ? BOUTON_PRINCIPAL : BOUTON_DANGER}
                  disabled={enCours}
                  autoFocus
                  onClick={() => (confirmation === "publier" ? onPublier(cles) : onRejeter(cles))}
                >
                  {enCours
                    ? confirmation === "publier"
                      ? "Publication..."
                      : "Rejet..."
                    : confirmation === "publier"
                      ? "Confirmer la publication"
                      : "Confirmer le rejet"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={BOUTON} onClick={onFermer}>
                Fermer
              </button>
              <button
                type="button"
                className={publier ? BOUTON : BOUTON_DANGER}
                disabled={nb === 0}
                onClick={() => setConfirmation("rejeter")}
              >
                Rejeter la sélection
              </button>
              <button
                type="button"
                className={publier ? BOUTON_PRINCIPAL : BOUTON}
                disabled={nb === 0}
                onClick={() => setConfirmation("publier")}
              >
                Publier la sélection
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
