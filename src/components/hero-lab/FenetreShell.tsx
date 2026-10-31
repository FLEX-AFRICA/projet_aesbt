"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CinematicText } from "@/components/ui/CinematicText";
import { SectionLabel } from "./SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Fond de la bande, repris par les variantes. */
export const FENETRE_BAND = "#FBF6EF";

/**
 * Cadre commun de la section « Fenêtre de l'étudiant ».
 *
 * En-tête centré (intitulé, titre révélé, paragraphe court sur téléphone et
 * complet dès `sm`), puis le visuel passé en `children`, puis le bloc
 * explication et appels à l'action. Les variantes d'affichage ne changent que
 * le visuel : le reste de la bande reste identique d'une version à l'autre.
 */
export function FenetreShell({ children, caption }: { children: ReactNode; caption?: string }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: FENETRE_BAND }}>
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 size-[460px] rounded-full bg-[#C9961B]/16 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-[#B4271C]/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1180px] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel align="center">Lancement officiel</SectionLabel>

          <CinematicText
            as="h2"
            delay={0.1}
            className="mt-6 font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.04] tracking-tight text-[#1A1A1A]"
          >
            Fenêtre de l'étudiant
          </CinematicText>

          <motion.p
            className="mx-auto mt-6 max-w-[58ch] text-left text-[15px] leading-relaxed text-[#5A4A42] sm:text-center lg:text-[16px]"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            <span className="sm:hidden">
              L'AESBT lance sa nouvelle rubrique : elle valorise les étudiants et stagiaires
              burkinabè en Tunisie, leurs compétences, leurs projets et leurs ambitions.
            </span>
            <span className="hidden sm:inline">
              Parce que chaque parcours mérite d'être connu, chaque réussite d'être célébrée et
              chaque étudiant d'être mis en lumière, l'AESBT lance sa nouvelle rubrique : elle
              valorise les étudiants et stagiaires burkinabè en Tunisie, leurs compétences, leurs
              projets, leurs engagements et leurs ambitions.
            </span>
          </motion.p>
        </div>

        <motion.div
          className="mt-12 sm:mt-14"
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {children}
          {caption ? (
            <p className="mt-3 text-center text-[12px] text-[#6B6B6B]">{caption}</p>
          ) : null}
        </motion.div>

        <motion.div
          className="mt-12 grid gap-8 border-t border-black/[0.07] pt-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="max-w-[54ch] text-[15px] leading-relaxed text-[#5A4A42] lg:text-[16px]">
            Chaque édition met à l'honneur un étudiant ou un stagiaire : son histoire, son parcours
            et sa vision. De quoi faire découvrir les talents de la communauté, et inspirer celles
            et ceux qui arrivent.
          </p>

          <div className="flex flex-wrap items-center gap-5 lg:justify-end">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-[#B4271C] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(180,39,28,0.22)] transition-transform hover:-translate-y-0.5"
            >
              Proposer un profil
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/actualites"
              className="text-[14px] font-semibold text-[#1A1A1A] underline decoration-[#C9961B] decoration-2 underline-offset-4 transition-colors hover:text-[#B4271C]"
            >
              Suivre les éditions
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
