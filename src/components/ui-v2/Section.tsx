import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * Briques de mise en page communes aux sections de la page d'accueil.
 *
 * Les fonds sont des aplats sobres (`bg-frost`, `bg-frost-deep`, `bg-ink`)
 * pris dans les jetons Tailwind du projet. La continuité entre sections est
 * obtenue par l'alternance et par <SectionJoin>, et non par un calque animé.
 */

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="mx-auto max-w-[1240px] px-6 py-20 sm:py-24">{children}</div>
    </section>
  );
}

/** Sur-titre + titre + accroche, alignés à gauche ou centrés. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  center?: boolean;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-accent-gold" : "text-accent-red"
          }`}
        >
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={70}>
        <h2
          className={`mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-balance sm:text-4xl ${
            dark ? "text-frost" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={130}>
          <p
            className={`mt-4 text-[15px] leading-relaxed text-pretty ${
              dark ? "text-frost/70" : "text-muted-ink"
            }`}
          >
            {lead}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

/**
 * Raccord entre deux sections de teintes différentes : un dégradé court, posé
 * dans le flux. Statique, donc gratuit à l'affichage — là où la version
 * précédente utilisait un calque `fixed` recalculé à chaque frame.
 */
export function SectionJoin({
  from,
  to,
}: {
  from: "frost" | "frost-deep" | "ink";
  to: "frost" | "frost-deep" | "ink";
}) {
  const map = {
    frost: "var(--color-frost)",
    "frost-deep": "var(--color-frost-deep)",
    ink: "var(--color-ink)",
  } as const;

  return (
    <div
      aria-hidden="true"
      className="h-16 w-full"
      style={{ background: `linear-gradient(to bottom, ${map[from]}, ${map[to]})` }}
    />
  );
}
