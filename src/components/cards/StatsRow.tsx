import type { Statistic } from "@/types/content";
import { CountUp } from "@/components/motion/CountUp";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * Bande de statistiques. Les valeurs non communiquées affichent « — » :
 * aucun chiffre n'est inventé. Les valeurs numériques s'animent en comptant
 * à l'apparition dans le viewport.
 */
export function StatsRow({ stats }: { stats: Statistic[] }) {
  return (
    <RevealGroup
      as="dl"
      className="mx-auto grid max-w-[1240px] grid-cols-2 gap-y-8 px-6 py-12 text-center md:grid-cols-4"
      stagger={0.1}
    >
      {stats.map((stat) => (
        <RevealItem key={stat.id}>
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span className="block font-display text-4xl tracking-tight text-ink">
              {stat.value ? <CountUp value={stat.value} /> : "—"}
            </span>
            <span className="mt-2 block text-[12px] uppercase tracking-[0.16em] text-muted-ink">
              {stat.label}
            </span>
          </dd>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
