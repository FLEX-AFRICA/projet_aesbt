import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { TonPastille } from "./Pastille";

const TONS: Record<TonPastille, string> = {
  ambre: "text-[#C9961B]",
  vert: "text-accent-green",
  rouge: "text-accent-red",
  gris: "text-muted-ink",
  accent: "text-accent-blue",
};

/**
 * Indicateur sobre pour les cellules de tableau : une icône colorée suivie
 * du texte, sans fond ni contour. Alternative légère à `Pastille`.
 */
export function Indicateur({
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
        "inline-flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-soft",
        className,
      )}
    >
      {Icone ? <Icone aria-hidden="true" className={cn("size-4", TONS[ton])} /> : null}
      {children}
    </span>
  );
}
