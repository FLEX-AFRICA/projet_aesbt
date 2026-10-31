"use client";

import Link from "next/link";
import { useRef } from "react";
import type { ComponentType, ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Quote, Users } from "lucide-react";
import { PatternBackdrop, type BackdropOptions } from "@/components/layout/PatternBackdrop";
import { SectionLabel } from "@/components/hero-lab/SectionLabel";
import { DEMO_AESBT_NEWS } from "@/data/news-demo";
import { ScrollProvider } from "@/lib/animation/ScrollProvider";

const EASE = [0.32, 0.72, 0, 1] as const;
const INK = "#1A1A1A";
const MUTED = "#5A4A42";
const SOFT = "#6B6B6B";
const RED = "#B4271C";
const GOLD = "#C9961B";
const PAPER = "#F3E9DC";
const CREAM = "#FBF1E4";

/** Motif tuilé en parallax, derrière le fil d'actualités (carré, donc répétable sans déformation). */
/**
 * Réglages du fond en motif tuilé (voir `BackdropOptions` pour toutes les
 * options) : `mobileZoom` règle la taille du motif sur mobile, `scroll` et
 * `mobileScroll` son sens de défilement ("vertical", "horizontal" ou "none").
 */
const BACKDROP: BackdropOptions = {
  src: "/white_background_6.jpg",
  tileSize: 230,
  mobileZoom: 2,
  scroll: "vertical",
};

/* ------------------------------------------------------------------ */
/* Le fil, en données de démonstration                                 */
/* ------------------------------------------------------------------ */

type ArticleShape = "hero" | "tall" | "wide" | "default";

type ArticleTile = {
  kind: "article";
  shape: ArticleShape;
  span: string;
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt?: string;
  image: string;
  alt: string;
};

type StatTile = {
  kind: "stat";
  span: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string;
  label: string;
  caption: string;
};

type QuoteTile = {
  kind: "quote";
  span: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

type Tile = ArticleTile | StatTile | QuoteTile;

/**
 * Disposition responsive à trois paliers :
 *
 *  MOBILE (< 640px) — 2 colonnes, tout empilé dans l'ordre naturel.
 *  TABLETTE (sm:, 2 colonnes) — même ordre.
 *  DESKTOP (lg:, 4 colonnes) — bento 4 × 3, parfaitement rempli :
 *    r1-2 : [Hero 2×2][Stat 1×2][bourses 1×2]
 *    r3   : [collecte 2×1][Quote 2×1]
 */
const TILES: Tile[] = [
  // 0 — Hero
  {
    kind: "article",
    shape: "hero",
    span: "col-span-2 lg:col-span-2 lg:row-span-2",
    slug: "jeppc-2026",
    category: "Vie associative",
    date: "18 octobre 2026",
    title: "JEPPC 2026 : plus de 300 étudiants réunis à l'ambassade du Burkina Faso",
    excerpt:
      "Conférences, tables rondes et retrouvailles entre promotions : retour sur une édition record, portée par les commissions culture et citoyenneté.",
    image: "/aesbt/jeppc-2026.jpg",
    alt: "Rassemblement des étudiants burkinabè à l'ambassade du Burkina Faso",
  },
  // 1 — Stat
  {
    kind: "stat",
    span: "col-span-1 lg:col-span-1 lg:row-span-2",
    icon: Users,
    value: "214",
    label: "nouveaux arrivants accueillis",
    caption: "Depuis la rentrée 2026, à l'aéroport comme au quai de départ.",
  },
  // 2 — Article tall
  {
    kind: "article",
    shape: "tall",
    span: "col-span-2 lg:col-span-1 lg:row-span-2",
    slug: "bourses-ambassade",
    category: "Partenariat",
    date: "6 octobre 2026",
    title: "Un nouvel accord avec l'ambassade pour les bourses 2026",
    image: "/aesbt/staff-groupe.jpg",
    alt: "Le bureau exécutif de l'AESBT",
  },
  // 3 — Article wide
  {
    kind: "article",
    shape: "wide",
    span: "col-span-2 lg:col-span-2 lg:row-span-1",
    slug: "collecte-rentree",
    category: "Solidarité",
    date: "28 septembre 2026",
    title: "La collecte de rentrée atteint 80 % de son objectif",
    excerpt:
      "Kits scolaires, premiers loyers, billets d'avion : la caisse de solidarité a déjà soutenu douze familles depuis septembre.",
    image: "/picture-11.jpg",
    alt: "Remise de kits de rentrée par l'AESBT",
  },
  // 4 — Citation
  {
    kind: "quote",
    span: "col-span-2 lg:col-span-2 lg:row-span-1",
    quote:
      "Arriver seule à Tunis, je redoutais tout. L'AESBT m'a trouvé un logement avant même mon premier cours.",
    name: "Aminata K.",
    role: "Étudiante en pharmacie, promotion 2025",
    avatar: "/aesbt/faces/face3.jpg",
  },
];

/** Les trois dernières publications, présentées en simples cartes éditoriales. */
const LATEST = ["nouveau-bureau", "journee-sportive", "cafe-des-metiers"]
  .map((slug) => DEMO_AESBT_NEWS.find((a) => a.slug === slug))
  .filter((a): a is NonNullable<typeof a> => Boolean(a));

/* ------------------------------------------------------------------ */
/* La page                                                              */
/* ------------------------------------------------------------------ */

/**
 * `nav` et `footer` : barre de navigation et pied de page rendus par un parent
 * serveur (ils lisent l'API ; ce composant est client).
 */
export function ActualitesPage({ nav, footer }: { nav?: ReactNode; footer?: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <ScrollProvider>
      <div className="min-h-screen bg-[#FBF6EF]">
        {nav}

        <main id="contenu">
          <div className="relative overflow-hidden">
            <PatternBackdrop {...BACKDROP} />

            <div className="relative z-10 pt-28 sm:pt-32">
              <Hero />

              <section className="relative pb-20 sm:pb-28 pt-6">
                <div aria-hidden="true" className="absolute inset-0 bg-white/80" />
                <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6">
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-4
                      sm:gap-5
                      lg:grid-cols-4
                      lg:auto-rows-[minmax(250px,auto)]
                      lg:grid-flow-row-dense
                    "
                  >
                    {TILES.map((tile, i) => (
                      <BentoTile key={tile.kind + i} tile={tile} index={i} />
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="relative bg-white/95">
            <LatestSection />
          </div>
        </main>

        {footer}
      </div>
    </ScrollProvider>
  );
}

/**
 * Motif tuilé en parallax, placé derrière le hero et le fil d'actualités
 * (bento). La section "Dernières publications", plus bas, a son propre fond
 * blanc pour rester lisible.
 */

/** En-tête de la page : fond blanc plein, sous un halo discret. */
function Hero() {
  const reduce = useReducedMotion();

  return (
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
        <SectionLabel align="center">Actualités</SectionLabel>
        <h1 className="mx-auto mt-6 max-w-[22ch] font-display text-[clamp(2.1rem,6vw,3.4rem)] font-semibold leading-[1.08] tracking-tight text-[#1A1A1A]">
          La vie de l'association.
        </h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-[15px] leading-relaxed text-[#6B6B6B] sm:text-[16px]">
          Publications, comptes rendus et informations officielles de l'AESBT
        </p>
      </motion.div>
    </section>
  );
}

/** Distribue chaque tuile vers l'affichage de sa nature. */
function BentoTile({ tile, index }: { tile: Tile; index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={tile.span}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 5) * 0.06 }}
    >
      {tile.kind === "article" ? <ArticleCard tile={tile} /> : null}
      {tile.kind === "stat" ? <StatCard tile={tile} /> : null}
      {tile.kind === "quote" ? <QuoteCard tile={tile} /> : null}
    </motion.div>
  );
}

/**
 * Dernières publications, en simples cartes éditoriales (image, titre,
 * rubrique) : la variété d'infos vient du bento au-dessus, cette section
 * ferme la page sur un rappel sobre, à la manière d'une salle de presse.
 */
function LatestSection() {
  const reduce = useReducedMotion();

  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-col items-center text-center pt-6">
          <SectionLabel align="center">À suivre</SectionLabel>
          <h2
            className="mt-4 font-display text-[1.7rem] font-semibold tracking-tight sm:text-[2rem]"
            style={{ color: INK }}
          >
            Dernières{" "}
            <span className="relative inline-block whitespace-nowrap">
              publications
              <TitleStroke />
            </span>
          </h2>
          <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
            Les autres annonces de l'association, pour ne rien manquer de la vie des promotions.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {LATEST.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            >
              <Link
                href={`/actualites/${article.slug}`}
                className="block w-full max-w-72 transition duration-300 hover:-translate-y-0.5"
              >
                <img
                  src={article.cover.src ?? undefined}
                  alt={article.cover.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <h3 className="mt-3 font-display text-base font-medium" style={{ color: INK }}>
                  {article.title}
                </h3>
                <p className="mt-1 text-xs font-medium" style={{ color: RED }}>
                  {article.category}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Carte commune aux cinq natures de tuile : fond plein, jamais de dégradé. */
const CARD =
  "flex size-full overflow-hidden rounded-[22px] bg-white ring-1 ring-black/[0.06] transition-[box-shadow,transform] duration-300";
const LIFT = "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(42,15,11,0.28)]";

/** Tuile article — la mise en page s'adapte à son format (hero / tall / wide / default). */
function ArticleCard({ tile }: { tile: ArticleTile }) {
  const { shape } = tile;
  const isWide = shape === "wide";
  const isHero = shape === "hero";
  const isTall = shape === "tall";

  // Visuel : ratio propre sur mobile, comportement flex sur desktop.
  const imageClass = isHero
    ? "flex-1 min-h-[200px] lg:min-h-0"
    : isTall
      ? "flex-1 min-h-[160px] lg:min-h-0"
      : isWide
        ? "aspect-[16/10] lg:aspect-auto lg:w-[42%]"
        : "h-32";

  return (
    <Link
      href={`/actualites/${tile.slug}`}
      className={`group ${CARD} ${LIFT} ${isWide ? "flex-col lg:flex-row" : "flex-col"}`}
    >
      {/* Visuel */}
      <div
        className={`relative shrink-0 overflow-hidden ${imageClass}`}
        style={{ backgroundColor: PAPER }}
      >
        <img
          src={tile.image}
          alt={tile.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
        />
      </div>

      {/* Propos */}
      <div
        className={`flex flex-col ${isHero || isWide ? "p-5" : "p-4"} ${isWide ? "flex-1" : ""}`}
      >
        <p
          className="text-[11px] font-semibold uppercase leading-none tracking-[0.18em]"
          style={{ color: RED }}
        >
          {tile.category}
          <span aria-hidden="true" className="mx-2 font-normal" style={{ color: GOLD }}>
            /
          </span>
          <span style={{ color: SOFT }}>{tile.date}</span>
        </p>

        <h3
          className={`mt-2 font-display font-semibold leading-snug tracking-tight ${
            isHero
              ? "text-[1.15rem] sm:text-[1.2rem] lg:text-[1.4rem]"
              : isWide
                ? "text-[1.05rem] sm:text-[1.1rem]"
                : "text-[1rem] sm:text-[1.05rem] line-clamp-2"
          }`}
          style={{ color: INK }}
        >
          {tile.title}
        </h3>

        {tile.excerpt ? (
          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
            {tile.excerpt}
          </p>
        ) : null}

        <span
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[12.5px] font-semibold"
          style={{ color: RED }}
        >
          Lire l'actualité
          <ArrowUpRight
            className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2.2}
          />
        </span>
      </div>
    </Link>
  );
}

/** Tuile chiffre : un repère marquant, sans photo, sans dégradé. */
function StatCard({ tile }: { tile: StatTile }) {
  const Icon = tile.icon;
  return (
    <div className={`${CARD} flex-col justify-between p-4 sm:p-6`}>
      <span
        className="grid size-9 sm:size-10 place-items-center rounded-full"
        style={{ backgroundColor: CREAM, color: RED }}
      >
        <Icon className="size-4 sm:size-[18px]" strokeWidth={2} />
      </span>
      <div className="mt-3 sm:mt-4">
        <p
          className="font-display text-[1.9rem] sm:text-[2.4rem] font-semibold leading-none tracking-tight"
          style={{ color: INK }}
        >
          {tile.value}
        </p>
        <p
          className="mt-1.5 text-[12px] sm:text-[13px] font-semibold leading-snug"
          style={{ color: RED }}
        >
          {tile.label}
        </p>
        <p className="mt-2 text-[11.5px] sm:text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
          {tile.caption}
        </p>
      </div>
    </div>
  );
}

/** Tuile témoignage : une voix de l'association, posée sur fond plein. */
function QuoteCard({ tile }: { tile: QuoteTile }) {
  return (
    <div
      className={`${CARD} flex-col justify-between p-5 sm:p-6`}
      style={{ backgroundColor: CREAM }}
    >
      <Quote className="size-6" style={{ color: GOLD }} strokeWidth={2} />
      <p
        className="mt-3 max-w-[46ch] font-display text-[1.1rem] sm:text-[1.15rem] font-medium italic leading-[1.35] tracking-tight"
        style={{ color: INK }}
      >
        {tile.quote}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <img
          src={tile.avatar}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-9 rounded-full object-cover ring-2 ring-white"
        />
        <div className="text-[12.5px] leading-tight">
          <p className="font-semibold" style={{ color: INK }}>
            {tile.name}
          </p>
          <p style={{ color: SOFT }}>{tile.role}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Le trait tracé sous « publications », à main levée comme sous le titre de
 * `CtaBand` : c'est lui qui porte l'accent, à la place d'une couleur ou d'une
 * pastille.
 */
function TitleStroke() {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 10"
      fill="none"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.16em] left-0 h-[0.2em] w-full overflow-visible"
      style={{ color: RED }}
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
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      />
    </svg>
  );
}
