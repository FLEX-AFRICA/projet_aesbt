import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Carte standard de l'espace membre. */
export const classeCarte = "rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6";

/** En-tête de page : pastille d'icône, titre, texte d'accroche, actions éventuelles. */
export function EnTetePage({
  icone: Icone,
  titre,
  texte,
  actions,
}: {
  icone: LucideIcon;
  titre: string;
  texte?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue"
        >
          <Icone className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink">{titre}</h1>
          {texte ? (
            <p className="mt-1.5 max-w-[70ch] text-[15px] leading-relaxed text-muted-ink">
              {texte}
            </p>
          ) : null}
        </div>
      </div>
      {actions}
    </header>
  );
}

/** État vide soigné : icône, message, et une action facultative. */
export function EtatVide({
  icone: Icone,
  titre,
  texte,
  action,
  className,
}: {
  icone: LucideIcon;
  titre: string;
  texte?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-8 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-full bg-frost-deep/70 text-muted-ink"
      >
        <Icone className="size-5" />
      </span>
      <p className="mt-3 font-display text-[16px] text-ink">{titre}</p>
      {texte ? (
        <p className="mt-1 max-w-[55ch] text-[14px] leading-relaxed text-muted-ink">{texte}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export type TonBadge = "attente" | "succes" | "neutre" | "danger" | "info";

const TONS: Record<TonBadge, string> = {
  attente: "bg-amber-100 text-amber-900 ring-amber-300/60",
  succes: "bg-emerald-100 text-emerald-900 ring-emerald-300/60",
  neutre: "bg-zinc-100 text-zinc-700 ring-zinc-300/60",
  danger: "bg-red-100 text-red-900 ring-red-300/60",
  info: "bg-accent-blue/10 text-accent-blue ring-accent-blue/25",
};

/** Badge de statut : le texte porte le sens, la couleur seule ne suffit pas. */
export function Badge({
  ton,
  children,
  icone: Icone,
}: {
  ton: TonBadge;
  children: ReactNode;
  icone?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
        TONS[ton],
      )}
    >
      {Icone ? <Icone aria-hidden="true" className="size-3" /> : null}
      {children}
    </span>
  );
}

/** Lien d'action principal ou secondaire, au style des boutons de l'espace. */
export const classeLienPrimaire =
  "inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";
