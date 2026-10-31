import { History } from "lucide-react";
import Link from "next/link";

import { formatDate } from "@/lib/format";

import { CarteIndisponible } from "./CarteIndisponible";
import type { Chargement } from "./chargement";
import { ACTIONS } from "./libelles";

export interface EntreeAudit {
  id: number;
  action: string;
  cible_type: string | null;
  created_at: string;
  acteur_nom: string | null;
}

/** Dernières lignes du journal d'audit. */
export function ActiviteRecente({ audit }: { audit: Chargement<{ entrees: EntreeAudit[] }> }) {
  return (
    <section aria-labelledby="titre-activite">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titre-activite" className="font-display text-lg tracking-tight text-ink">
          Activité récente
        </h2>
        <Link
          href="/admin/journal"
          className="rounded-sm text-[13px] font-semibold text-accent-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40"
        >
          Voir tout
        </Link>
      </div>

      <div className="mt-4">
        {!audit.ok ? (
          <CarteIndisponible titre="Journal d'activité" />
        ) : audit.donnees.entrees.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface/60 p-6 text-center text-[14px] text-muted-ink">
            Aucune action enregistrée pour le moment.
          </p>
        ) : (
          <ol className="divide-y divide-line/70 overflow-hidden rounded-2xl border border-line bg-surface/60">
            {audit.donnees.entrees.map((entree) => (
              <li key={entree.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-frost-deep text-muted-ink"
                >
                  <History className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-[14px] text-ink-soft">
                  <span className="font-medium text-ink">{entree.acteur_nom ?? "Quelqu'un"}</span>{" "}
                  {ACTIONS[entree.action] ?? entree.action}
                </span>
                <time dateTime={entree.created_at} className="shrink-0 text-[12px] text-muted-ink">
                  {formatDate(entree.created_at.slice(0, 10))}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
