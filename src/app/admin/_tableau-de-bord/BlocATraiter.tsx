import { CircleCheck } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

export interface ElementATraiter {
  cle: string;
  libelle: string;
  /** Nombre d'éléments en attente ; null si la donnée n'a pas pu être chargée. */
  nombre: number | null;
  href: string;
  action: string;
  icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

/**
 * Bloc mis en avant : tout ce qui attend une décision du bureau, avec un
 * bouton d'action direct par ligne. Une ligne dont le comptage a échoué
 * reste cliquable mais n'affiche pas de faux zéro.
 */
export function BlocATraiter({ elements }: { elements: ElementATraiter[] }) {
  const actifs = elements.filter((e) => e.nombre === null || e.nombre > 0);
  const total = elements.reduce((somme, e) => somme + (e.nombre ?? 0), 0);

  return (
    <section
      aria-labelledby="titre-a-traiter"
      className="rounded-2xl border border-accent-blue/40 bg-accent-blue/[0.04] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titre-a-traiter" className="font-display text-lg tracking-tight text-ink">
          À traiter
        </h2>
        {total > 0 ? (
          <p className="text-[13px] font-medium text-accent-blue">
            {total} élément{total > 1 ? "s" : ""} en attente
          </p>
        ) : null}
      </div>

      {actifs.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-[14px] text-ink-soft">
          <CircleCheck aria-hidden className="size-5 text-accent-green" />
          Rien n'attend de décision du bureau. Beau travail.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {actifs.map(({ cle, libelle, nombre, href, action, icone: Icone }) => (
            <li
              key={cle}
              className="flex items-center gap-3 rounded-xl border border-line bg-background/80 p-3"
            >
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-blue/10 text-accent-blue"
              >
                <Icone aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-medium leading-none text-ink">
                  {nombre ?? "?"}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted-ink">{libelle}</p>
              </div>
              <Link
                href={href}
                className="shrink-0 rounded-full bg-accent-blue px-3.5 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2"
              >
                {action}
                <span className="sr-only"> : {libelle}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
