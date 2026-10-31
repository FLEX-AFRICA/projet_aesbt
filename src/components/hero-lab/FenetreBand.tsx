"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Editable } from "@/components/editable/Editable";
import { LienEditable, Zone, useTexte } from "@/components/editable/ZoneEditable";
import { CinematicText } from "@/components/ui/CinematicText";
import { SectionLabel } from "./SectionLabel";
import { FenetreBandFlip } from "./FenetreBandFlip";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Fond de la bande. */
const BAND = "#FBF6EF";

/**
 * Section « Fenêtre de l'étudiant » : le lancement de la rubrique.
 *
 * La bande est bâtie comme une annonce : en-tête centré, le titre révélé mot à
 * mot (`CinematicText`, registre Planes), puis le magazine défilant
 * (`FenetreBandFlip`) qui présente les cinq facettes mises en lumière par la
 * rubrique.
 */
export function FenetreBand() {
  const reduce = useReducedMotion();
  // CinematicText exige une `string` : la valeur est lue par accesseur et
  // passée telle quelle (pas de JSX en enfant).
  const titre = useTexte("accueil.fenetre.titre", "Fenêtre de l'étudiant");

  return (
    <section className="relative" style={{ backgroundColor: BAND }}>
      {/* `overflow-hidden` est porté par ce calque décoratif, pas par la section :
          la pile défilante plus bas a besoin que la section reste un ancêtre
          "non scrollant" pour que son `position: sticky` fonctionne. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[460px] rounded-full bg-[#C9961B]/16 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-[#B4271C]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6 py-6 sm:py-6">
        {/* L'annonce */}
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel align="center">
            <Editable cle="accueil.fenetre.etiquette" />
          </SectionLabel>

          <Zone cle="accueil.fenetre.titre" as="div">
            <CinematicText
              as="h2"
              delay={0.1}
              className="mt-6 font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.04] tracking-tight text-[#1A1A1A]"
            >
              {titre}
            </CinematicText>
          </Zone>

          <motion.p
            className="mx-auto mt-6 max-w-[58ch] text-left text-[15px] leading-relaxed text-[#5A4A42] sm:text-center lg:text-[16px]"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            {/* Version courte sur téléphone, complète à partir de sm. */}
            <Editable cle="accueil.fenetre.intro_courte" type="texte_long" className="sm:hidden" />
            <Editable
              cle="accueil.fenetre.intro_longue"
              type="texte_long"
              className="hidden sm:inline"
            />
          </motion.p>
        </div>

        {/* Les facettes, en pile que l'on fait défiler */}
        <div className="-mx-6 mt-2 sm:mt-2">
          <FenetreBandFlip />
        </div>

        {/* Le fonctionnement, et comment y figurer */}
        <motion.div
          className="mt-4 grid gap-8 border-t border-black/[0.07] pt-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <Editable
            as="p"
            type="texte_long"
            cle="accueil.fenetre.explication"
            className="max-w-[54ch] text-[15px] leading-relaxed text-[#5A4A42] lg:text-[16px]"
          />

          <div className="flex flex-wrap items-center gap-5 lg:justify-end">
            <LienEditable
              cleLien="accueil.fenetre.cta_lien"
              cleLibelle="accueil.fenetre.cta_libelle"
              repliLien="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-[#B4271C] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(180,39,28,0.22)] transition-transform hover:-translate-y-0.5"
            >
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </LienEditable>
            <LienEditable
              cleLien="accueil.fenetre.lien2_lien"
              cleLibelle="accueil.fenetre.lien2_libelle"
              repliLien="/actualites"
              className="text-[14px] font-semibold text-[#1A1A1A] underline decoration-[#C9961B] decoration-2 underline-offset-4 transition-colors hover:text-[#B4271C]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
