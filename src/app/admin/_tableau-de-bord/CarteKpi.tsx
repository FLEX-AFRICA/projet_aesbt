import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

/** Évolution entre le mois précédent et le mois en cours. */
export interface Tendance {
  precedent: number;
  courant: number;
}

function PastilleTendance({ tendance }: { tendance: Tendance }) {
  const ecart = tendance.courant - tendance.precedent;
  const Fleche = ecart > 0 ? ArrowUpRight : ecart < 0 ? ArrowDownRight : ArrowRight;
  const texte =
    ecart === 0
      ? "Stable par rapport au mois précédent"
      : `${ecart > 0 ? "+" : ""}${ecart} par rapport au mois précédent`;
  return (
    <p
      className={cn(
        "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium",
        ecart > 0 ? "bg-accent-green/10 text-accent-green" : "bg-frost-deep/60 text-muted-ink",
      )}
    >
      <Fleche aria-hidden className="size-3.5" />
      {texte}
    </p>
  );
}

/** Carte d'indicateur : valeur dominante, icône, tendance mensuelle optionnelle. */
export function CarteKpi({
  valeur,
  libelle,
  icone: Icone,
  href,
  tendance,
}: {
  valeur: number;
  libelle: string;
  icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href?: string;
  tendance?: Tendance | undefined;
}) {
  const classes =
    "block rounded-2xl border border-line bg-surface/60 p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40";
  const contenu = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[34px] font-medium leading-none text-ink">{valeur}</p>
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-frost-deep text-ink-soft"
        >
          <Icone aria-hidden className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-muted-ink">{libelle}</p>
      {tendance ? <PastilleTendance tendance={tendance} /> : null}
    </>
  );
  return href ? (
    <Link href={href} className={cn(classes, "hover:bg-surface")}>
      {contenu}
    </Link>
  ) : (
    <div className={classes}>{contenu}</div>
  );
}
