import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TonPastille = "ambre" | "vert" | "rouge" | "gris" | "accent";

const TONS: Record<TonPastille, string> = {
  ambre: "bg-[#C9961B]/10 text-[#8a6610] ring-[#C9961B]/30",
  vert: "bg-accent-green/10 text-accent-green ring-accent-green/30",
  rouge: "bg-accent-red/10 text-accent-red ring-accent-red/30",
  gris: "bg-frost-deep/60 text-ink-soft ring-line",
  accent: "bg-accent-blue/10 text-accent-blue ring-accent-blue/30",
};

/**
 * Pastille colorée avec icône pour les statuts et rôles. Le texte porte le
 * sens : la couleur et l'icône sont des renforts, jamais seuls.
 */
export function Pastille({
  icone: Icone,
  ton = "gris",
  children,
  className,
}: {
  icone?: LucideIcon | undefined;
  ton?: TonPastille | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset",
        TONS[ton],
        className,
      )}
    >
      {Icone ? <Icone aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </span>
  );
}
