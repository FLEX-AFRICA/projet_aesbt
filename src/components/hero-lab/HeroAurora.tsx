"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AESBT_PHOTOS } from "@/components/home/themes";
import { Editable } from "@/components/editable/Editable";
import { useContenu } from "@/components/editable/ContenusClient";
import { elementsDe, texteDe } from "@/components/editable/contenu";
import { ImageEditable, LienEditable, Zone } from "@/components/editable/ZoneEditable";
import DynamicText from "@/components/kokonutui/dynamic-text";
import FlowField from "@/components/kokonutui/flow-field";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Mots de repli du titre du hero, utilisés seulement si la liste du registre
 * (`accueil.hero.titre_mots`) est vide. Les mots réels viennent du contexte.
 *
 * Chaque mot doit se lire après « Une communauté, » : ce sont donc tous des
 * adjectifs au féminin singulier, accordés avec « communauté ».
 */
const MORPH_WORDS_REPLI = ["forte", "unie", "soudée"];

/**
 * Hero clair et minimaliste.
 *
 * Le logo est posé dans une carte blanche (mise en valeur sans surcharge),
 * le titre se recompose en boucle sur son dernier mot, puis la photo du
 * collectif arrive directement, avec un seul appel à l'action en dessous.
 */
export function HeroAurora() {
  // Mots du titre : lus du registre à chaque rendu (plus de constante figée à
  // l'import), mémoïsés pour que l'animation ne reparte pas à chaque rendu.
  const brutMots = useContenu("accueil.hero.titre_mots");
  const mots = useMemo(() => {
    const liste = elementsDe(brutMots)
      .map((el) => texteDe(el["mot"]))
      .filter((m) => m !== "");
    return liste.length > 0 ? liste : MORPH_WORDS_REPLI;
  }, [brutMots]);

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#FBF6EF]">
      {/* Halos chauds très doux, pour que le crème ne soit pas plat */}
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 size-[620px] rounded-full bg-[#E8A61E]/18 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 top-24 size-[520px] rounded-full bg-[#B4271C]/12 blur-[120px]"
      />

      {/* Champ de vent, or discret sur fond clair */}
      <FlowField
        className="absolute inset-0 text-[#C9961B]/45"
        density={0.55}
        speed={0.6}
        interactive
      />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6 pb-20 pt-28 sm:pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Le logo dans une carte : mis en valeur, sans prendre toute la place. */}
          <motion.div
            className="group relative rounded-[26px] border border-black/[0.06] bg-white/90 p-5 shadow-[0_14px_40px_rgba(42,15,11,0.10)] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
          >
            {/* Lueur chaude qui respire derrière la carte */}
            <span
              aria-hidden="true"
              className="absolute -inset-3 -z-10 rounded-[32px] bg-gradient-to-br from-[#E8A61E]/25 to-[#B4271C]/18 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <ImageEditable
              cle="commun.logo"
              cleAlt="accueil.hero.logo_alt"
              repli="/logo_aesbt.jpg"
              altRepli="AESBT, Association des Étudiants et Stagiaires Burkinabè en Tunisie"
              width={150}
              height={150}
              fetchPriority="high"
              className="h-auto w-[110px] mix-blend-multiply sm:w-[150px]"
            />
          </motion.div>

          <motion.h1
            className="mt-9 max-w-[20ch] font-display text-[clamp(2.75rem,8.5vw,5rem)] font-semibold leading-[0.98] tracking-tight text-[#1A1A1A]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: EASE }}
          >
            <Editable cle="accueil.hero.titre_debut" />{" "}
            <Zone cle="accueil.hero.titre_mots" type="liste">
              <DynamicText
                mode="morph"
                words={mots}
                interval={2200}
                className="inline-block align-baseline text-[#B4271C]"
              />
            </Zone>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-[#5A4A42] lg:text-[17px]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
          >
            <Editable cle="accueil.hero.intro" type="texte_long" />
          </motion.p>
        </div>

        {/* La photo du collectif, juste après le texte */}
        <motion.figure
          className="relative mt-12 overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_24px_70px_rgba(42,15,11,0.16)]"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease: EASE }}
        >
          <ImageEditable
            cle="accueil.hero.photo"
            cleAlt="accueil.hero.photo_alt"
            repli={AESBT_PHOTOS.staff}
            altRepli="Le collectif AESBT réuni lors d'un événement de l'association"
            fetchPriority="high"
            className="aspect-[16/9] w-full rounded-[22px] object-cover object-top"
          />
          <figcaption className="absolute inset-x-2 bottom-2 flex flex-wrap items-center justify-between gap-3 rounded-b-[22px] bg-gradient-to-t from-black/65 to-transparent px-5 pb-4 pt-12 text-[13px] font-medium text-white">
            <Editable cle="accueil.hero.photo_legende" />
            <span className="text-white/80">
              <Editable cle="commun.site.membres_nombre" />+ membres
            </span>
          </figcaption>
        </motion.figure>

        {/* Un seul appel à l'action, sous la photo */}
        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8, ease: EASE }}
        >
          <LienEditable
            cleLien="accueil.hero.cta_lien"
            cleLibelle="accueil.hero.cta_libelle"
            repliLien="/inscription"
            className="rounded-full bg-[#B4271C] px-8 py-4 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(180,39,28,0.22)] transition-transform hover:-translate-y-0.5"
          />
        </motion.div>
      </div>
    </section>
  );
}
