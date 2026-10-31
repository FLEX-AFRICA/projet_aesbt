import { CalendarHeart, GraduationCap, Plane, Users, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Parcours de l'étudiant, en frise verticale.
 *
 * Le trait n'est plus piloté par la position de scroll (l'ancienne version
 * recalculait une hauteur à chaque frame via `useScroll` + `useSpring`, ce qui
 * déclenchait un layout en continu). Ici le rail est un simple dégradé fixe, et
 * seuls les jalons apparaissent, chacun par son propre `IntersectionObserver`
 * qui se débranche aussitôt. Visuellement l'effet est le même à la lecture.
 */

const STEPS: { icon: LucideIcon; period: string; title: string; body: string }[] = [
  {
    icon: Plane,
    period: "Avant le départ",
    title: "Préparer son arrivée",
    body: "Informations sur les démarches, les villes universitaires et le logement : on sait où l'on va avant de partir.",
  },
  {
    icon: Users,
    period: "Les premiers jours",
    title: "Être accueilli",
    body: "Un contact sur place dès l'atterrissage, et le weekend d'intégration pour rencontrer celles et ceux qui sont déjà passés par là.",
  },
  {
    icon: CalendarHeart,
    period: "Toute l'année",
    title: "Vivre la communauté",
    body: "Événements culturels, rencontres sportives et temps forts patriotiques : la vie associative qui fait tenir, loin de chez soi.",
  },
  {
    icon: GraduationCap,
    period: "À la sortie",
    title: "Réussir et transmettre",
    body: "Accompagnement jusqu'au diplôme, puis l'occasion de devenir à son tour le contact d'un nouvel arrivant.",
  },
];

export function Timeline() {
  return (
    <ol className="relative mt-14 m-0 list-none space-y-10 p-0 pl-14 sm:pl-16">
      {/* Rail : dégradé statique, du rouge vers l'or. */}
      <div
        aria-hidden="true"
        className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-red via-accent-gold to-accent-gold/20 sm:left-[23px]"
      />

      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <li key={step.title} className="relative">
            <Reveal delay={Math.min(i * 70, 280)}>
              {/* Pastille : ring en `box-shadow` de la couleur du fond, pour
                  masquer le rail derrière l'icône sans calque supplémentaire. */}
              <span className="absolute -left-14 top-0 grid size-10 place-items-center rounded-full border border-accent-red/25 bg-frost shadow-[0_0_0_6px_var(--color-frost)] sm:-left-16">
                <Icon size={17} strokeWidth={1.9} aria-hidden="true" className="text-accent-red" />
              </span>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-red">
                {step.period}
              </p>
              <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[56ch] text-[14.5px] leading-relaxed text-muted-ink">
                {step.body}
              </p>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
