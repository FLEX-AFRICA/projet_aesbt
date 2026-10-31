import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Classes du bouton principal, alignées sur les pages d'administration existantes. */
export const classeBoutonPrincipal =
  "inline-flex items-center justify-center rounded-full bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

type ActionPrincipale =
  { libelle: string; href: string } | { libelle: string; onClick: () => void; disabled?: boolean };

/**
 * En-tête de page d'administration : titre, description et action principale
 * (lien ou bouton). `children` accueille des actions secondaires.
 */
export function EnTetePageAdmin({
  titre,
  description,
  action,
  children,
  className,
  icone: Icone,
  filAriane,
}: {
  /** Icône décorative affichée devant le titre (facultative). */
  icone?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** Fil d'ariane facultatif ; le dernier élément peut omettre `href`. */
  filAriane?: readonly { libelle: string; href?: string }[];
  titre: string;
  description?: ReactNode;
  action?: ActionPrincipale;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icone ? (
          <span
            aria-hidden
            className="mt-0.5 hidden size-11 shrink-0 place-items-center rounded-xl bg-accent-blue/10 text-accent-blue sm:grid"
          >
            <Icone aria-hidden className="size-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          {filAriane && filAriane.length > 0 ? (
            <nav aria-label="Fil d'ariane" className="mb-1.5">
              <ol className="flex flex-wrap items-center gap-1 text-[12px] text-muted-ink">
                {filAriane.map((etape, i) => (
                  <li key={`${etape.libelle}-${i}`} className="flex items-center gap-1">
                    {i > 0 ? <ChevronRight aria-hidden className="size-3" /> : null}
                    {etape.href ? (
                      <Link
                        href={etape.href}
                        className="rounded-sm hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40"
                      >
                        {etape.libelle}
                      </Link>
                    ) : (
                      <span aria-current="page">{etape.libelle}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-[28px]">
            {titre}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[75ch] text-[15px] leading-relaxed text-muted-ink">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {action ? (
          "href" in action ? (
            <Link href={action.href} className={classeBoutonPrincipal}>
              {action.libelle}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={classeBoutonPrincipal}
            >
              {action.libelle}
            </button>
          )
        ) : null}
      </div>
    </header>
  );
}
