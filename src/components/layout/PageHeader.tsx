import type { ReactNode } from "react";

/**
 * En-tête de page institutionnel, réutilisé sur toutes les pages internes.
 *
 * `backgroundImage` est optionnel : sans lui, l'en-tête garde son fond crème
 * uni habituel. Avec lui (page association), la photo occupe tout l'en-tête,
 * sous un voile blanc qui la laisse reconnaissable sans sacrifier la
 * lisibilité du texte sombre posé par-dessus.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  backgroundImage,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line/70 bg-frost-deep/40">
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-white/75" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-[1240px] px-6 py-14 sm:py-16">
        <div className="max-w-3xl animate-rise">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-muted-ink text-pretty">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** Conteneur de section standard (largeur et rythme verticaux communs). */
export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-[1240px] px-6 py-14 sm:py-16">{children}</div>
    </section>
  );
}
