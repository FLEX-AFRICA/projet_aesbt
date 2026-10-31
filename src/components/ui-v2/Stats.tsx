import { Reveal } from "./Reveal";

/**
 * Bandeau de chiffres, sur fond sombre.
 *
 * Les valeurs sont écrites en clair, sans compteur animé : un `CountUp`
 * déclenche un re-render par frame et par chiffre, pour un gain visuel faible.
 */

const STATS: { value: string; label: string }[] = [
  { value: "3 200+", label: "Membres de la communauté" },
  { value: "2", label: "Pays, une même famille" },
  { value: "100 %", label: "Bénévole et solidaire" },
];

export function Stats() {
  return (
    <div className="grid gap-10 sm:grid-cols-3">
      {STATS.map((stat, i) => (
        <Reveal key={stat.label} delay={Math.min(i * 70, 240)}>
          <div className="border-l border-frost/15 pl-5">
            <span className="block font-display text-4xl font-medium tracking-tight text-accent-gold sm:text-5xl">
              {stat.value}
            </span>
            <span className="mt-2.5 block text-[13.5px] leading-snug text-frost/65">
              {stat.label}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
