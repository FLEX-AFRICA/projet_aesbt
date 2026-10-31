"use client";

import Link from "next/link";
import { Editable } from "@/components/editable/Editable";
import { LienEditable } from "@/components/editable/ZoneEditable";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AESBT_PHOTOS } from "@/components/home/themes";
import { SectionLabel } from "./SectionLabel";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Une entrée « à l'affiche ».
 *
 * Les champs ne portent que des informations déjà établies par l'association.
 * `meta` reste vide tant qu'un lieu, une date ou un état n'est pas connu :
 * rien n'est inventé ici (voir `src/config/site.ts`).
 */
type Affiche = {
  id: string;
  /** Rubrique, telle qu'elle paraît sur la page Actualités. */
  kind: string;
  title: string;
  /** Lieu, date ou état, uniquement si l'information est connue. */
  meta?: string | undefined;
  image: string;
  alt: string;
  to: string;
};

/**
 * À remplacer par les publications officielles quand le fil d'actualités sera
 * alimenté (`src/data/news.ts`, aujourd'hui en données de démonstration). La
 * première entrée est mise en avant, les suivantes passent en colonne.
 */
const AFFICHE: Affiche[] = [
  {
    id: "jeppc",
    kind: "Vie associative",
    title: "JEPPC 2026, à l'ambassade du Burkina Faso",
    meta: "Tunis",
    image: AESBT_PHOTOS.jeppc,
    alt: "Journées Nationales d'Engagement Patriotique et de Participation Citoyenne",
    to: "/actualites",
  },
  {
    id: "weekend",
    kind: "Intégration",
    title: "Weekend d'intégration",
    meta: "À venir",
    image: AESBT_PHOTOS.weekend,
    alt: "Weekend d'intégration de l'AESBT",
    to: "/actualites",
  },
];

/**
 * Section « À l'affiche » : les dernières actualités de l'association.
 *
 * La mise en page est celle d'une page de journal plutôt que d'une galerie :
 * une entrée en vedette à gauche, large, et la suite en colonne à droite,
 * chaque entrée ouverte par un filet. Chacune porte sa rubrique, son lieu ou
 * son état et son titre, et mène à la page Actualités.
 *
 * La bande est réglée pour tenir dans un écran d'ordinateur sans défilement :
 * marges resserrées, vedette en 16/9 et plafonnée à 340 px de haut.
 *
 * Sur téléphone, où la hauteur n'est plus la contrainte, la mise en page
 * respire : l'en-tête est centré comme dans les autres sections, la vedette
 * reprend un 4/3 (le 16/9 y rognait trop la photo) et les brèves deviennent de
 * vraies lignes de liste, chacune ouverte par un filet et sur une vignette
 * assez grande pour qu'on la lise.
 *
 * Les deux entrées affichées sont les seules dont l'association ait établi le
 * contenu. Le fil complet (`src/data/news.ts`) est encore en données de
 * démonstration : il n'est donc pas branché ici, pour ne pas afficher de
 * titres vides en page d'accueil.
 */
export function NewsBand() {
  const reduce = useReducedMotion();
  const [lead, ...rest] = AFFICHE;

  return (
    <section className="relative border-t border-black/[0.06] bg-[#FCFCFB]">
      <div className="mx-auto max-w-[1180px] px-6 py-14 sm:py-16">
        {/* L'en-tête : l'intitulé, le propos, et l'accès au fil complet. */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-x-10 sm:text-left">
          <div>
            <SectionLabel align="responsive">
              <Editable cle="accueil.actus.etiquette" />
            </SectionLabel>
            <Editable
              as="h2"
              cle="accueil.actus.titre"
              className="mx-auto mt-4 max-w-[22ch] font-display text-[1.75rem] font-medium leading-tight tracking-tight text-[#1A1A1A] sm:mx-0 sm:text-[2.1rem]"
            />
          </div>
          <LienEditable
            cleLien="accueil.actus.tout_lien"
            cleLibelle="accueil.actus.tout_libelle"
            repliLien="/actualites"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-[13px] font-semibold text-[#1A1A1A] transition-colors hover:border-[#B4271C]/30 hover:bg-[#B4271C]/[0.04] hover:text-[#B4271C]"
          >
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </LienEditable>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
          {/* La vedette */}
          {lead ? (
            <motion.article
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Link href={lead.to} className="group block">
                <figure className="relative m-0 overflow-hidden rounded-[22px] bg-[#F3E9DC]">
                  <img
                    src={lead.image}
                    alt={lead.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-institutional group-hover:scale-[1.03] sm:aspect-[16/9] sm:max-h-[340px]"
                  />
                </figure>
                <Kicker kind={lead.kind} meta={lead.meta} className="mt-5" />
                <h3 className="mt-3 max-w-[26ch] font-display text-[clamp(1.25rem,2.2vw,1.65rem)] font-semibold leading-[1.15] tracking-tight text-[#1A1A1A]">
                  <span className="bg-gradient-to-r from-[#B4271C] to-[#B4271C] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-institutional group-hover:bg-[length:100%_2px]">
                    {lead.title}
                  </span>
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#B4271C]">
                  <Editable cle="accueil.actus.lire_libelle" />
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </span>
              </Link>
            </motion.article>
          ) : null}

          {/* La suite, en colonne */}
          <div className="flex flex-col">
            {rest.map((item, i) => (
              <motion.article
                key={item.id}
                className="border-t border-black/[0.09] py-5 sm:py-6"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.08 }}
              >
                <Link href={item.to} className="group flex items-start gap-4">
                  <figure className="m-0 w-[124px] shrink-0 overflow-hidden rounded-[14px] bg-[#F3E9DC] sm:w-[132px]">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-institutional group-hover:scale-[1.04]"
                    />
                  </figure>
                  <div className="min-w-0">
                    <Kicker kind={item.kind} meta={item.meta} />
                    <h3 className="mt-2 font-display text-[17px] font-semibold leading-snug tracking-tight text-[#1A1A1A] transition-colors group-hover:text-[#B4271C]">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </motion.article>
            ))}

            {/* Le renvoi vers le fil, qui ferme la colonne. */}
            <motion.div
              className="mt-auto border-t border-black/[0.09] pt-5 sm:pt-6"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.24 }}
            >
              <Editable
                as="p"
                type="texte_long"
                cle="accueil.actus.renvoi_texte"
                className="text-[14px] leading-relaxed text-[#5A4A42] lg:text-[15px]"
              />
              <LienEditable
                cleLien="accueil.actus.renvoi_lien"
                cleLibelle="accueil.actus.renvoi_libelle"
                repliLien="/actualites"
                className="group mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1A1A1A] underline decoration-[#C9961B] decoration-2 underline-offset-4 transition-colors hover:text-[#B4271C]"
              >
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </LienEditable>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * La ligne de rubrique, au-dessus du titre.
 *
 * Petites capitales espacées, comme les intitulés de section, et une barre
 * oblique dorée pour séparer la rubrique du lieu : pas de pastille.
 */
function Kicker({
  kind,
  meta,
  className,
}: {
  kind: string;
  meta?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase leading-none tracking-[0.2em] text-[#B4271C] ${className ?? ""}`}
    >
      {kind}
      {meta ? (
        <>
          <span aria-hidden="true" className="mx-2 font-normal text-[#C9961B]">
            /
          </span>
          <span className="text-[#6B6B6B]">{meta}</span>
        </>
      ) : null}
    </p>
  );
}
