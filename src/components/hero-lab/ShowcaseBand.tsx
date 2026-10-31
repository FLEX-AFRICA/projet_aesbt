"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Editable } from "@/components/editable/Editable";
import { useContenu, useContenus } from "@/components/editable/ContenusClient";
import { elementsDe, texteDe, urlImage } from "@/components/editable/contenu";
import { LienEditable, useAttributsZone } from "@/components/editable/ZoneEditable";
import { AESBT_RING_PHOTOS } from "./PhotoRing";
import { PhotoReel } from "./PhotoReel";
import { SectionLabel } from "./SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Section « L'AESBT en mouvement ».
 *
 * Le montage est animé par le code (`PhotoReel`) et non plus joué depuis un
 * fichier vidéo : fond transparent par construction, netteté à toute taille,
 * et contenu modifiable sans réencodage. Les photos de l'association
 * (`public/picture-*.jpg`) y traversent une suite de compositions, de la pile
 * au plein cadre, comme dans un générique.
 *
 * La disposition reste celle des autres bandes du site : le visuel à gauche,
 * le propos et les liens à droite. Le cadre prend la plus grande part de la
 * largeur (620 px au plus, en 5/4), les clichés se lisent donc vraiment. Le
 * montage se règle sur la largeur de son cadre (unités de conteneur), il tient
 * donc cette place sans rien perdre de sa composition. Il est détouré, posé à
 * même le crème sur un halo chaud qui l'assied sans l'encadrer.
 *
 * Les fichiers `public/showcase*.{mp4,webm}` ne sont plus référencés.
 */
export function ShowcaseBand() {
  const reduce = useReducedMotion();

  // Photos du montage : lues du registre, mémoïsées (PhotoReel compose ses
  // poses d'après le nombre et l'ordre des photos). Liste vide : photos d'origine.
  const { medias } = useContenus();
  const brutPhotos = useContenu("accueil.montage.photos");
  const photos = useMemo(() => {
    const liste = elementsDe(brutPhotos)
      .map((el) => ({ src: urlImage(el["src"], medias) ?? "", alt: texteDe(el["alt"]) }))
      .filter((p) => p.src !== "");
    return liste.length > 0 ? liste : AESBT_RING_PHOTOS;
  }, [brutPhotos, medias]);
  const zonePhotos = useAttributsZone("accueil.montage.photos", "liste");

  return (
    <section className="relative overflow-hidden bg-[#FBF6EF]">
      <div
        aria-hidden="true"
        className="absolute -left-40 top-20 size-[520px] rounded-full bg-[#C9961B]/14 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1180px] px-6 py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          {/* Le montage, détouré, posé à même le fond */}
          <motion.div
            {...zonePhotos}
            className="relative mx-auto w-full max-w-[620px] lg:mx-0"
            initial={reduce ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {/* Halo chaud derrière le montage, pour l'asseoir sur le crème */}
            <div
              aria-hidden="true"
              className="absolute inset-[12%] -z-10 rounded-full bg-gradient-to-br from-[#E8A61E]/25 to-[#B4271C]/15 blur-3xl"
            />
            <PhotoReel photos={photos} className="aspect-[5/4] w-full" />
          </motion.div>

          {/* Le texte */}
          <div className="text-center lg:text-left">
            <SectionLabel align="responsive">
              <Editable cle="accueil.montage.etiquette" />
            </SectionLabel>

            <motion.h2
              className="mx-auto mt-5 max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.06] tracking-tight text-[#1A1A1A] lg:mx-0"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Editable cle="accueil.montage.titre" />
            </motion.h2>

            <motion.p
              className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-[#5A4A42] lg:mx-0 lg:text-[16px]"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              <Editable cle="accueil.montage.texte" type="texte_long" />
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            >
              <LienEditable
                cleLien="accueil.montage.galerie_lien"
                cleLibelle="accueil.montage.galerie_libelle"
                repliLien="/galerie"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-6 py-3.5 text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </LienEditable>
              <span className="text-[13px] text-[#6B6B6B]">
                <Editable cle="commun.site.membres_nombre" />
                <Editable cle="accueil.montage.suivi_suffixe" />
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
