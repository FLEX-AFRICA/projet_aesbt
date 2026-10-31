"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { REGISTRATION_ROUTE } from "@/config/site";
import { AESBT_CONTACT } from "@/components/home/themes";
import { MosaicBackground } from "./MosaicBackground";

export type HeroLayout = "epure" | "coins" | "asymetrique";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Hero immersif, fond mosaïque (mur de la communauté), avec 3 dispositions de
 * contenu minimalistes au choix :
 *  - « epure »       : titre + 1 CTA, centrés, beaucoup de vide ;
 *  - « coins »       : titre bas-gauche, petites infos ancrées aux coins ;
 *  - « asymetrique » : composition décalée, type studio de design.
 */
export function HeroImmersif({ layout }: { layout: HeroLayout }) {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden">
      <MosaicBackground />
      {layout === "epure" && <LayoutEpure />}
      {layout === "coins" && <LayoutCoins />}
      {layout === "asymetrique" && <LayoutAsymetrique />}
    </section>
  );
}

const CTA_PRIMARY =
  "rounded-full bg-[#B4271C] px-7 py-3.5 text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5";
const CTA_GHOST =
  "rounded-full border border-white/40 px-7 py-3.5 text-[14px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/10";

/* ------------------------------------------------------------------ */
/* Variante A — épuré centré                                           */
/* ------------------------------------------------------------------ */
function LayoutEpure() {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.p
        className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#E8A61E]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        AESBT
      </motion.p>
      <motion.h1
        className="mt-6 max-w-[16ch] font-display text-6xl font-medium leading-[0.95] tracking-tight text-white sm:text-8xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.9, ease: EASE }}
      >
        Plus forts, ensemble.
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="mt-10"
      >
        <Link href={REGISTRATION_ROUTE} className={CTA_PRIMARY}>
          Rejoindre l'association
        </Link>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variante B — titre bas-gauche + infos ancrées aux coins             */
/* ------------------------------------------------------------------ */
function LayoutCoins() {
  return (
    <>
      {/* Coins hauts */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 pt-28 text-[12px] font-medium tracking-wide text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <span>Tunis — Tunisie</span>
        <span>Burkina Faso</span>
      </motion.div>

      {/* Titre + CTA en bas-gauche */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 items-end px-6 pb-16">
        <div>
          <motion.p
            className="text-[13px] font-semibold uppercase tracking-[0.24em] text-[#E8A61E]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Étudiants & stagiaires burkinabè
          </motion.p>
          <motion.h1
            className="mt-4 max-w-[13ch] font-display text-6xl font-medium leading-[0.96] tracking-tight text-white sm:text-8xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: EASE }}
          >
            Plus forts, ensemble.
          </motion.h1>
          <motion.div
            className="mt-9 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <Link href={REGISTRATION_ROUTE} className={CTA_PRIMARY}>
              Rejoindre l'association
            </Link>
            <Link href="/association" className={CTA_GHOST}>
              Découvrir l'AESBT
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Coins bas */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 pb-6 text-[12px] font-medium tracking-wide text-white/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-[#E8A61E]" />
          Défiler
        </span>
        <span>{AESBT_CONTACT.followers}+ membres</span>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Variante C — asymétrique / studio                                   */
/* ------------------------------------------------------------------ */
function LayoutAsymetrique() {
  return (
    <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1240px] grid-rows-[1fr_auto] px-6 pb-16 pt-32">
      {/* Titre éclaté, décalé */}
      <div className="flex items-center">
        <motion.h1
          className="font-display font-medium leading-[0.9] tracking-tight text-white"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
        >
          {[
            { t: "Plus", cls: "text-5xl sm:text-7xl md:text-8xl ml-0" },
            { t: "forts,", cls: "text-6xl sm:text-8xl md:text-9xl ml-[12vw] text-[#E8A61E]" },
            { t: "ensemble.", cls: "text-5xl sm:text-7xl md:text-8xl ml-[4vw]" },
          ].map((line) => (
            <span key={line.t} className="block overflow-hidden">
              <motion.span
                className={`block ${line.cls}`}
                variants={{
                  hidden: { y: "110%" },
                  visible: { y: "0%", transition: { duration: 0.7, ease: EASE } },
                }}
              >
                {line.t}
              </motion.span>
            </span>
          ))}
        </motion.h1>
      </div>

      {/* Pied : accroche à gauche, CTA à droite */}
      <motion.div
        className="flex flex-col gap-6 border-t border-white/15 pt-6 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <p className="max-w-[40ch] text-[15px] leading-relaxed text-white/80">
          L'Association des Étudiants et Stagiaires Burkinabè en Tunisie — de l'arrivée à la
          réussite.
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href={REGISTRATION_ROUTE} className={CTA_PRIMARY}>
            Rejoindre l'association
          </Link>
          <Link href="/association" className={CTA_GHOST}>
            Découvrir
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
