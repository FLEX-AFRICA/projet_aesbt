"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Editable } from "@/components/editable/Editable";
import { SectionLabel } from "@/components/hero-lab/SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

const TITRE =
  "mx-auto mt-6 max-w-[22ch] font-display text-[clamp(2.1rem,6vw,3.4rem)] font-semibold leading-[1.08] tracking-tight text-[#1A1A1A]";
const DESCRIPTION =
  "mx-auto mt-5 max-w-[56ch] text-[15px] leading-relaxed text-[#6B6B6B] sm:text-[16px]";

/**
 * En-tête de la page association, calqué sur celui des actualités : fond blanc
 * plein, halo doré discret, contenu centré.
 *
 * Le fond (motif tuilé) est posé par la page, derrière ce hero : celui-ci
 * garde un fond blanc plein et le motif reste visible derrière la navbar.
 *
 * Titre et description viennent du registre (`<Editable>`, sous
 * `ContenusProvider`). Le `h1` reste un vrai `h1` : `Editable` rend la balise
 * elle-même, sans wrapper, et l'animation reste portée par le `motion.div`.
 * Sans `title`/`description` (cas de la page association) ils viennent du
 * registre ; la page contact les passe encore en props.
 * Le sur-titre vient aussi du registre (`association.hero.etiquette`) quand la
 * prop `eyebrow` est absente.
 */
export function AssociationHero({
  eyebrow,
  title,
  description,
}: {
  /** Absent : le sur-titre vient du registre (`association.hero.etiquette`). */
  eyebrow?: string;
  /** Absent : le titre vient du registre (`association.hero.titre`). */
  title?: string;
  /** Absente : la description vient du registre (`association.hero.description`). */
  description?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-white" />
        <div
          aria-hidden="true"
          className="absolute -left-32 top-16 size-[420px] rounded-full bg-[#C9961B]/10 blur-[130px]"
        />

        <motion.div
          className="relative mx-auto max-w-[1180px] px-6 pb-14 pt-10 text-center sm:pb-20 sm:pt-14"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <SectionLabel align="center">
            {eyebrow === undefined ? <Editable cle="association.hero.etiquette" /> : eyebrow}
          </SectionLabel>
          {title === undefined ? (
            <Editable cle="association.hero.titre" as="h1" className={TITRE} />
          ) : (
            <h1 className={TITRE}>{title}</h1>
          )}
          {description === undefined ? (
            <Editable
              cle="association.hero.description"
              type="texte_long"
              as="p"
              className={DESCRIPTION}
            />
          ) : (
            <p className={DESCRIPTION}>{description}</p>
          )}
        </motion.div>
      </section>
    </>
  );
}
