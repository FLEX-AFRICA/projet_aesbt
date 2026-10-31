"use client";

import { formatDate } from "@/lib/format";

import type { Soumission } from "../_lib/detail";

const BOUTON =
  "inline-flex items-center justify-center rounded-md border border-line bg-background px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-40";
const BOUTON_PRINCIPAL =
  "inline-flex items-center justify-center rounded-md bg-accent-blue px-3 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:opacity-40";

/**
 * Bandeau d'une soumission en attente de validation. L'administrateur y trouve
 * les actions (relire, publier, rejeter) ; l'éditeur, seulement l'état.
 */
export function BandeauSoumission({
  soumission,
  estAdmin,
  occupe,
  onRelire,
  onPublier,
  onRejeter,
}: {
  soumission: Soumission;
  estAdmin: boolean;
  occupe: boolean;
  onRelire: () => void;
  onPublier: () => void;
  onRejeter: () => void;
}) {
  const auteur = soumission.soumisParNom ?? "Un éditeur";
  return (
    <section
      aria-label="Soumission en attente de validation"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#C9961B]/40 bg-[#C9961B]/10 px-3 py-2"
    >
      <div className="min-w-0 flex-1 text-[13px] text-ink">
        <p className="font-semibold">
          {estAdmin
            ? "Modifications en attente de votre validation"
            : "En attente de validation par un administrateur"}
        </p>
        <p className="text-muted-ink">
          Soumis par <strong className="font-semibold text-ink">{auteur}</strong> le{" "}
          {formatDate(soumission.soumisLe)}
          {soumission.note ? (
            <>
              {" "}
              : <span className="break-words text-ink">« {soumission.note} »</span>
            </>
          ) : null}
        </p>
      </div>
      {estAdmin ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BOUTON} disabled={occupe} onClick={onRelire}>
            Relire les modifications
          </button>
          <button type="button" className={BOUTON_PRINCIPAL} disabled={occupe} onClick={onPublier}>
            Publier
          </button>
          <button type="button" className={BOUTON} disabled={occupe} onClick={onRejeter}>
            Rejeter
          </button>
        </div>
      ) : null}
    </section>
  );
}
