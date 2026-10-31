"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake, GraduationCap, Plane, Users } from "lucide-react";
import DynamicText from "@/components/kokonutui/dynamic-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { SectionLabel } from "./SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

const MORPH_WORDS = ["la solidarité", "l'entraide", "la réussite", "une famille"];

/**
 * Les quatre engagements, chacun dans sa carte : on lit un titre et une ligne,
 * pas un paragraphe. `accent` colore l'icône pour différencier les cartes.
 */
const PILLARS = [
  {
    icon: Plane,
    title: "À l'arrivée",
    text: "Accueil, démarches administratives et premiers repères à Tunis.",
    accent: "#B4271C",
  },
  {
    icon: GraduationCap,
    title: "Pendant les études",
    text: "Orientation, entraide scolaire et accompagnement jusqu'au diplôme.",
    accent: "#C9961B",
  },
  {
    icon: HeartHandshake,
    title: "Au quotidien",
    text: "Logement, santé, coup de main : personne ne reste seul face à un imprévu.",
    accent: "#2E7D4F",
  },
  {
    icon: Users,
    title: "Toute l'année",
    text: "Événements, rencontres et vie associative entre les deux pays.",
    accent: "#B4271C",
  },
];

/**
 * Section « Ce qui nous réunit », claire.
 *
 * Le propos tient dans une phrase dont le dernier mot se recompose, puis se
 * détaille en quatre cartes : le lecteur accroche sur des titres courts au
 * lieu de buter sur un bloc de texte.
 */
export function ValuesBand() {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden bg-[#F3F1EC]">
      {/* Halo chaud très doux, pour éviter l'aplat gris */}
      <div
        aria-hidden="true"
        className="absolute -right-40 top-0 size-[520px] rounded-full bg-[#E8A61E]/14 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1180px] px-6 py-20 sm:py-28">
        {/* L'en-tête, centré sur téléphone comme dans les autres sections. */}
        <div className="text-center sm:text-left">
          <SectionLabel align="responsive">Ce qui nous réunit</SectionLabel>

          <motion.h2
            className="mx-auto mt-5 max-w-[24ch] sm:mx-0 font-display text-[clamp(1.9rem,4.6vw,3.25rem)] font-medium leading-[1.06] tracking-tight text-[#1A1A1A]"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span>À l'AESBT, on cultive</span>{" "}
            {reduce ? (
              <span className="text-[#B4271C]">la solidarité.</span>
            ) : (
              <DynamicText
                mode="morph"
                words={MORPH_WORDS}
                interval={2200}
                className="inline-block align-baseline text-[#B4271C]"
              />
            )}
          </motion.h2>
        </div>

        {/* Les quatre engagements, en cartes */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} index={i} reduce={reduce} accent={p.accent}>
              <AnimatedIcon
                icon={p.icon}
                accent={p.accent}
                index={i}
                animate={isMobile && !reduce}
              />
              <h3 className="mt-5 font-display text-[19px] font-medium tracking-tight text-[#1A1A1A]">
                {p.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6B6B6B] lg:text-[15px]">
                {p.text}
              </p>
            </PillarCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  children,
  index,
  reduce,
  accent,
}: {
  children: ReactNode;
  index: number;
  reduce: boolean | null;
  accent: string;
}) {
  return (
    <motion.article
      className="group relative h-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_10px_rgba(42,15,11,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(42,15,11,0.10)]"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.08 }}
    >
      {/* Filet coloré qui se révèle au survol */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
      {children}
    </motion.article>
  );
}

/**
 * L'icône de la carte.
 *
 * Sur téléphone (`animate`), elle glisse nettement de gauche à droite dans une
 * piste arrondie, comme la pastille d'un interrupteur que l'on active, puis
 * revient, en boucle. Le décalage par carte (`index`) donne un effet de vague.
 * Sur écran large, ou si l'utilisateur limite les animations, l'icône reste
 * fixe et sans piste : la présentation d'origine ne bouge pas.
 */
function AnimatedIcon({
  icon: Icon,
  accent,
  index,
  animate,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; style?: CSSProperties }>;
  accent: string;
  index: number;
  animate: boolean;
}) {
  if (!animate) {
    return <Icon className="size-5" strokeWidth={1.75} style={{ color: accent }} />;
  }

  return (
    <span
      className="inline-flex h-8 w-14 items-center rounded-full px-1.5"
      style={{ backgroundColor: `${accent}14` }}
    >
      <motion.span
        className="inline-flex"
        animate={{ x: [0, 24, 0] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: [0.32, 0.72, 0, 1],
          delay: index * 0.15,
        }}
      >
        <Icon className="size-5" strokeWidth={1.75} style={{ color: accent }} />
      </motion.span>
    </span>
  );
}
