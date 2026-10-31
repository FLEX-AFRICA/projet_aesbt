"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AESBT_CONTACT } from "@/components/home/themes";
import { Editable, EditableListe } from "@/components/editable/Editable";
import { useContenu, useContenus } from "@/components/editable/ContenusClient";
import { texteDe, urlImage } from "@/components/editable/contenu";
import { GrainGradient } from "@/components/ui/grain-gradient";
import { REGISTRATION_ROUTE } from "@/config/site";
import { SectionLabel } from "./SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Entrée du contenu : les blocs arrivent l'un après l'autre. */
const GROUP = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/**
 * Appel à l'adhésion, sur le dégradé grainé animé (WebGL) de la page.
 *
 * Le fond est celui de l'ancienne bande des chiffres clés (crème et or pâle,
 * qui respirent lentement) : seule la matière posée dessus change.
 *
 * La bande se lit en deux temps, séparés par un filet qui se trace : le propos
 * au-dessus, l'action en dessous. Sous le titre, un trait dessiné à main levée
 * se tire sous les derniers mots : c'est lui qui porte l'accent, à la place
 * d'une pastille.
 *
 * Tout ce qui bouge ici marche au doigt comme à la souris, puisque rien ne
 * dépend d'un curseur :
 *
 * - le contenu entre par blocs à l'arrivée dans le champ (`whileInView`) ;
 * - les traits se dessinent au même moment (`pathLength`, `scaleX`) ;
 * - il se décale doucement au fil du défilement (`useScroll`), ce qui donne de
 *   la profondeur à la bande sans rien demander au visiteur ;
 * - le bouton respire, une lumière le balaie et sa flèche pousse vers la
 *   droite, trois animations au minuteur (voir `cta-*` dans `styles.css`) ;
 * - l'appui est rendu par `active:`, que le tactile déclenche aussi.
 *
 * Les textes viennent du registre (`commun.cta.*`) via `<Editable>`. Piège
 * d'animation : les enfants directs du groupe portent `variants={ITEM}` pour
 * hériter du `staggerChildren`. Ils restent donc des `motion.*` ; `<Editable>`
 * n'est jamais un enfant direct, seulement un `span` à l'intérieur de l'élément
 * animé, qui garde ses variantes, sa `ref` et son rôle. Hors de tout provider,
 * les valeurs retombent sur les défauts locaux.
 */
export function CtaBand() {
  const reduce = useReducedMotion();
  const { medias } = useContenus();
  const lienBouton = texteDe(useContenu("commun.cta.bouton_lien"), REGISTRATION_ROUTE);
  const lienQuestion = texteDe(useContenu("commun.cta.question_lien"), "/contact");
  const band = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: band,
    offset: ["start end", "end start"],
  });
  /** Ressort : le décalage suit le défilement sans en copier les saccades. */
  const drift = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.4 });
  const lift = useTransform(drift, [0, 1], [26, -26]);
  const halo = useTransform(drift, [0, 0.5, 1], [0.75, 1.1, 0.85]);

  return (
    <section ref={band} className="relative isolate overflow-hidden">
      <GrainGradient
        className="absolute inset-0 size-full"
        colorDark="#F6D9A8"
        colorMid="#FBEEDC"
        colorLight="#FFFDF9"
        angle={28}
        curve={0.35}
        softness={0.6}
        scale={1.15}
        grain={0.35}
        speed={reduce ? 0 : 0.4}
      />
      {/* Voile clair : garde le dégradé pâle et le texte sombre lisible. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#FBF6EF]/55" />

      {/* Le halo du fond, qui enfle au passage de la bande. */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 size-[min(80vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#E8A61E]/30 to-[#B4271C]/20 blur-[90px]"
        {...(reduce ? {} : { style: { scale: halo } })}
      />

      <motion.div
        className="relative z-10 mx-auto max-w-[1180px] px-6 py-10 sm:py-16"
        {...(reduce ? {} : { style: { y: lift } })}
      >
        <motion.div
          className="flex flex-col items-center text-center"
          variants={GROUP}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={ITEM}>
            <SectionLabel align="center">
              <Editable cle="commun.cta.etiquette" />
            </SectionLabel>
          </motion.div>

          <motion.h2
            variants={ITEM}
            className="mt-7 max-w-[20ch] font-display text-[clamp(1.9rem,8vw,3.6rem)] font-semibold leading-[1.06] tracking-tight text-[#1A1A1A] sm:max-w-[24ch]"
          >
            <Editable cle="commun.cta.titre_debut" />{" "}
            {/* Le trait court sous ces trois mots : l'accent de la bande. */}
            <span className="relative inline-block whitespace-nowrap">
              <Editable cle="commun.cta.titre_accent" />
              <Stroke />
            </span>
          </motion.h2>

          <motion.p
            variants={ITEM}
            className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-[#5A4A42] lg:text-[16px]"
          >
            <Editable cle="commun.cta.intro" type="texte_long" />
          </motion.p>

          {/* Le filet qui sépare le propos de l'action. */}
          <motion.span
            aria-hidden="true"
            variants={ITEM}
            className="mt-12 h-px w-full max-w-[560px] origin-center bg-gradient-to-r from-transparent via-[#B4271C]/30 to-transparent"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
          />

          {/* L'action : le bouton, puis ceux qui y sont déjà. */}
          <motion.div
            variants={ITEM}
            className="mt-10 flex w-full flex-col items-center gap-7 sm:w-auto sm:flex-row sm:gap-9"
          >
            <div className="relative w-full sm:w-auto">
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 animate-cta-halo rounded-full bg-[#B4271C]/35 blur-xl motion-reduce:animate-none"
              />
              <Link
                href={lienBouton}
                className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#B4271C] px-8 text-[15px] font-semibold text-white shadow-[0_16px_38px_-12px_rgba(180,39,28,0.7)] transition-[transform,background-color] duration-200 ease-institutional hover:bg-[#9E1B14] active:scale-[0.97] sm:w-auto sm:min-w-[15rem]"
              >
                {/* La lumière qui balaie le bouton : c'est elle qui le signale
                    sur un écran où il n'y a pas de curseur à suivre. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent motion-reduce:hidden"
                />
                <Editable cle="commun.cta.bouton_libelle" />
                <ArrowRight
                  className="size-4 shrink-0 animate-cta-nudge motion-reduce:animate-none"
                  strokeWidth={2}
                />
              </Link>
            </div>

            {/* Le filet vertical, qui se tire entre les deux : il ne paraît
                que là où les deux blocs sont côte à côte. */}
            <motion.span
              aria-hidden="true"
              className="hidden h-12 w-px origin-top bg-black/10 sm:block"
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            />

            <div className="flex items-center gap-4">
              <EditableListe
                cle="commun.cta.visages"
                as="span"
                ariaHidden
                className="flex -space-x-3"
                renderItem={(visage) => {
                  const src = urlImage(visage["src"], medias);
                  return src ? (
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-9 rounded-full border-2 border-[#FBF6EF] object-cover"
                    />
                  ) : null;
                }}
              />
              <p className="text-left text-[13px] leading-snug text-[#5A4A42]">
                <span className="block font-semibold text-[#1A1A1A]">
                  {AESBT_CONTACT.followers}+ membres
                </span>
                <Editable cle="commun.cta.membres_precision" />
              </p>
            </div>
          </motion.div>

          <motion.p variants={ITEM} className="mt-9 text-[13px] text-[#6B6B6B]">
            <Editable cle="commun.cta.question_debut" />{" "}
            <Link
              href={lienQuestion}
              className="font-semibold text-[#1A1A1A] underline decoration-[#B4271C]/40 decoration-2 underline-offset-4 hover:decoration-[#B4271C]"
            >
              <Editable cle="commun.cta.question_lien_libelle" />
            </Link>
            <Editable cle="commun.cta.question_fin" /> {AESBT_CONTACT.phone}.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Le trait tracé sous les derniers mots du titre.
 *
 * Une seule courbe, légèrement irrégulière, comme tirée à la main : elle se
 * dessine de gauche à droite à l'arrivée dans le champ. `preserveAspectRatio`
 * est désactivé pour qu'elle épouse la largeur du texte, quelle que soit la
 * taille du titre.
 */
function Stroke() {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 10"
      fill="none"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.18em] left-0 h-[0.22em] w-full overflow-visible text-[#B4271C]"
    >
      <motion.path
        d="M2 7.4C40 3.2 78 1.8 110 2.4c33 .6 70 2.4 108 5.6"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1, ease: EASE, delay: 0.45 }}
      />
    </svg>
  );
}
