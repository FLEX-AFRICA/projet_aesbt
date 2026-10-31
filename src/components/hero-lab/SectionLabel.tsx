"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.32, 0.72, 0, 1] as const;

type Align = "left" | "center" | "responsive";

/** Mise en place du bloc, par alignement. */
const WRAP: Record<Align, string> = {
  left: "",
  center: "justify-center",
  responsive: "justify-center sm:justify-start",
};

/** Origine du filet de tête : il se trace vers l'extérieur du libellé. */
const LEAD: Record<Align, string> = {
  left: "origin-left",
  center: "origin-right",
  responsive: "origin-right sm:origin-left",
};

/** Filet de queue, s'il y en a un. */
const TRAIL: Record<Align, string | null> = {
  left: null,
  center: "origin-left",
  responsive: "origin-left sm:hidden",
};

/** Couleurs d'intitulé, reprises des accents du logo. */
const TONES = {
  accent: "text-[#B4271C]",
  gold: "text-[#C9961B]",
  ink: "text-[#1A1A1A]",
} as const;

/**
 * Intitulé d'une section.
 *
 * Un libellé en petites capitales espacées, accompagné d'un filet qui se trace
 * à l'arrivée dans le champ. Pas de pastille, pas de point : le filet donne
 * l'accroche, et toutes les sections ouvrent de la même manière.
 *
 * `align` décide de la mise en place du filet : à gauche du libellé pour une
 * section alignée à gauche, de part et d'autre pour une section centrée (les
 * deux filets s'écartent alors du texte, comme un rideau qui s'ouvre).
 *
 * `responsive` tient les deux : centré avec ses deux filets sur téléphone, où
 * les titres de section sont centrés, aligné à gauche avec un seul filet dès
 * la première rupture. Le filet de tête change d'origine en conséquence, pour
 * se tracer toujours vers l'extérieur du libellé.
 */
export function SectionLabel({
  children,
  align = "left",
  tone = "accent",
  className,
}: {
  children: ReactNode;
  align?: Align;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const trail = TRAIL[align];

  const rule = (origin: string) => (
    <motion.span
      aria-hidden="true"
      className={`h-px w-8 bg-current sm:w-12 ${origin}`}
      initial={reduce ? false : { scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 0.5 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, ease: EASE }}
    />
  );

  return (
    <motion.span
      className={`inline-flex items-center gap-3 text-[11px] font-semibold uppercase leading-none tracking-[0.26em] ${TONES[tone]} ${WRAP[align]} ${className ?? ""}`}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {rule(LEAD[align])}
      {children}
      {trail ? rule(trail) : null}
    </motion.span>
  );
}
