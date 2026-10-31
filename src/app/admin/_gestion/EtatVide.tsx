import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** État vide soigné : icône, message et suite éventuelle (lien de réinitialisation). */
export function EtatVide({
  icone: Icone,
  titre,
  children,
}: {
  icone: LucideIcon;
  titre: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/40 px-6 py-10 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-frost-deep text-muted-ink">
        <Icone aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-3 font-display text-[16px] text-ink">{titre}</p>
      {children ? <div className="mt-1 text-[14px] text-muted-ink">{children}</div> : null}
    </div>
  );
}
