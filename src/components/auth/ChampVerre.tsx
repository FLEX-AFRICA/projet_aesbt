import type { ReactNode } from "react";

type Props = {
  /** Identifiant de la saisie contenue, relié au libellé. */
  htmlFor: string;
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * Champ « verre » : libellé, puis conteneur arrondi à bordure et fond léger
 * dont l'état de focus est visible dès qu'une saisie qu'il contient est active.
 */
export function ChampVerre({ htmlFor, label, children, className = "" }: Props) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-muted-ink">
        {label}
      </label>
      <div className="relative rounded-2xl border border-line bg-ink/[0.03] backdrop-blur-sm transition-colors focus-within:border-accent-blue/70 focus-within:bg-accent-blue/5 focus-within:ring-2 focus-within:ring-accent-blue/25">
        {children}
      </div>
    </div>
  );
}
