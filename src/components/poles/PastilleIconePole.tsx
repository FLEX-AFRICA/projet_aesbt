import { cn } from "@/lib/utils";

import { iconePole } from "./icones-poles";

/** Pastille verte arrondie portant l'icône d'un pôle (clé de l'API). */
export function PastilleIconePole({
  icone,
  className,
  iconeClassName,
}: {
  icone: string | null | undefined;
  className?: string;
  iconeClassName?: string;
}) {
  const Icone = iconePole(icone);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl bg-[#2E7D4F]/10 text-[#2E7D4F]",
        className,
      )}
    >
      <Icone className={cn("size-5", iconeClassName)} strokeWidth={1.75} />
    </span>
  );
}
