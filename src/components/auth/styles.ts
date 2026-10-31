/** Classes communes aux champs des pages d'authentification. */

/** Saisie nue, à placer dans un `ChampVerre` qui porte bordure et fond. */
export const CLASSE_ENTREE =
  "w-full rounded-2xl bg-transparent p-4 text-[15px] text-ink outline-none placeholder:text-muted-ink/60";

export const CLASSE_BOUTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-blue px-4 py-4 text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:opacity-50";

export const CLASSE_LIEN =
  "font-semibold text-accent-blue underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";

/** Titre fort des écrans d'authentification. */
export const CLASSE_TITRE =
  "font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl";

/** Message d'erreur de formulaire. */
export const CLASSE_ERREUR =
  "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800";
