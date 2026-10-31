"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Jalons de l'histoire de l'association.
 *
 * Conformément à `src/data/association.ts`, aucune date n'est inventée : les
 * repères sont nommés par étape (« Les débuts », « La structuration »...) et
 * les années exactes seront ajoutées quand le Bureau les aura communiquées.
 */
const MILESTONES = [
  {
    period: "Les débuts",
    title: "Quelques étudiants, une entraide",
    body: "Des étudiants burkinabè arrivés à Tunis s'organisent pour s'entraider : accueil à l'aéroport, démarches, premiers repères.",
  },
  {
    period: "La structuration",
    title: "L'association prend forme",
    body: "Le collectif se dote de statuts, d'un bureau exécutif et de commissions pour porter la voix des étudiants et stagiaires.",
  },
  {
    period: "L'essor",
    title: "Une communauté qui rayonne",
    body: "Weekend d'intégration, journées patriotiques, activités culturelles et sportives : la vie associative s'installe sur toute l'année.",
  },
  {
    period: "Aujourd'hui",
    title: "Un relais reconnu",
    body: "L'AESBT est l'interlocutrice des étudiants, des institutions et de l'Ambassade, entre la Tunisie et le Burkina Faso.",
  },
];

/**
 * Section « Notre histoire » : frise horizontale sur grand écran, verticale sur
 * mobile, dont le trait se remplit au défilement. Renvoie vers la page
 * d'histoire complète.
 */
export function HistoryBand() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.5 });
  const fill = useTransform(reduce ? scrollYProgress : smooth, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative overflow-hidden bg-[#FBF6EF]">
      <div
        aria-hidden="true"
        className="absolute -left-32 bottom-0 size-[480px] rounded-full bg-[#2E7D4F]/10 blur-[120px]"
      />

      <div ref={ref} className="relative mx-auto max-w-[1180px] px-6 py-20 sm:py-28">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:text-left">
          <div>
            <SectionLabel align="responsive">Notre histoire</SectionLabel>
            <motion.h2
              className="mx-auto mt-4 max-w-[20ch] sm:mx-0 font-display text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.06] tracking-tight text-[#1A1A1A]"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              D'une entraide entre amis à toute une communauté.
            </motion.h2>
          </div>

          <HistoryLink className="hidden sm:inline-flex" />
        </div>

        {/* Frise */}
        <div className="relative mt-14">
          {/* Rail horizontal (grand écran) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[11px] hidden h-px bg-black/10 lg:block"
          >
            <motion.span
              className="block h-px origin-left bg-gradient-to-r from-[#B4271C] to-[#C9961B]"
              style={{ width: fill }}
            />
          </div>
          {/* Rail vertical (mobile) */}
          <div
            aria-hidden="true"
            className="absolute bottom-2 left-[11px] top-2 w-px bg-black/10 lg:hidden"
          >
            <motion.span
              className="block w-px origin-top bg-gradient-to-b from-[#B4271C] to-[#C9961B]"
              style={{ height: fill }}
            />
          </div>

          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {MILESTONES.map((m, i) => (
              <motion.li
                key={m.period}
                className="relative pl-10 lg:pl-0"
                initial={reduce ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
              >
                {/* Pastille sur le rail */}
                <span
                  aria-hidden="true"
                  className="absolute left-[5px] top-[5px] size-3 rounded-full border-2 border-[#FBF6EF] bg-[#B4271C] lg:left-0 lg:top-[5px]"
                />
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#C9961B] lg:mt-7">
                  {m.period}
                </p>
                <h3 className="mt-2 font-display text-[19px] font-semibold leading-snug tracking-tight text-[#1A1A1A]">
                  {m.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6B6B6B] lg:text-[15px]">
                  {m.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-12 sm:hidden">
          <HistoryLink />
        </div>
      </div>
    </section>
  );
}

function HistoryLink({ className }: { className?: string }) {
  return (
    <Link
      href="/association"
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-[14px] font-semibold text-[#1A1A1A] transition-colors hover:border-[#B4271C]/30 hover:bg-[#B4271C]/[0.04] ${className ?? ""}`}
    >
      Lire notre histoire
      <ArrowRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={2}
      />
    </Link>
  );
}
