"use client";

import { motion } from "framer-motion";
import { Editable } from "@/components/editable/Editable";
import { ImageEditable, LienEditable } from "@/components/editable/ZoneEditable";
import { MASCOT_BY_ID } from "./mascots/registry";
import { SectionLabel } from "./SectionLabel";

/**
 * Bloc « Scène », centré, placé en bas de page.
 *
 * La mascotte (image statique pour le moment — l'animation sera réintroduite
 * plus tard) est au centre du bloc, avec le texte et deux liens utiles
 * dessous. Respiration conviviale avant le pied de page.
 */
export function SceneBlock() {
  const mascot = MASCOT_BY_ID["garcon-cartoon"];
  const height = 340;
  const width = 210;

  return (
    <section className="relative overflow-hidden bg-[#FBF6EF]">
      <div className="mx-auto flex max-w-[760px] flex-col items-center px-6 py-20 text-center sm:py-24">
        {/* Mascotte centrée, sur un décor circulaire */}
        <motion.div
          className="relative grid place-items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="absolute size-[320px] rounded-full bg-gradient-to-br from-[#C9961B]/20 to-[#B4271C]/15 blur-2xl" />
          <div className="absolute size-[280px] rounded-full border border-[#B4271C]/15" />
          <ImageEditable
            cle="accueil.accompagnement.mascotte"
            cleAlt="accueil.accompagnement.mascotte_alt"
            repli={mascot.src}
            altRepli={mascot.alt}
            width={width}
            height={height}
            className="relative drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)]"
            style={{ height, width }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
        >
          <SectionLabel align="center" className="mt-8">
            <Editable cle="accueil.accompagnement.etiquette" />
          </SectionLabel>
          <Editable
            as="h2"
            cle="accueil.accompagnement.titre"
            className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl"
          />
          <Editable
            as="p"
            type="texte_long"
            cle="accueil.accompagnement.texte"
            className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-[#555] lg:text-[16px]"
          />

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LienEditable
              cleLien="accueil.accompagnement.ressources_lien"
              cleLibelle="accueil.accompagnement.ressources_libelle"
              repliLien="/ressources"
              className="rounded-full bg-[#1A1A1A] px-5 py-3 text-[14px] font-semibold text-white"
            />
            <LienEditable
              cleLien="accueil.accompagnement.membre_lien"
              cleLibelle="accueil.accompagnement.membre_libelle"
              repliLien="/inscription"
              className="rounded-full border border-black/15 px-5 py-3 text-[14px] font-semibold text-[#1A1A1A]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
