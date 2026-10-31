"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { EASE_INSTITUTIONAL } from "@/lib/animation/easing";
import { Section } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui-aesbt/SectionHeading";
import { ActionLink } from "@/components/ui-aesbt/ActionButton";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ParallaxMediaFrame } from "@/components/motion/ParallaxMediaFrame";
import { ClientHeroScene } from "@/components/immersive/ClientHeroScene";
import { NewsCard } from "@/components/cards/NewsCard";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { NextEventPanel } from "@/components/cards/EventCard";
import { StatsRow } from "@/components/cards/StatsRow";
import { EmptyState } from "@/components/ui-aesbt/States";
import { PRESIDENT_MESSAGE, STATISTICS } from "@/data/association";
import { listLatestNews } from "@/data/news";
import { listAlbums } from "@/data/albums";
import { getNextEvent } from "@/data/events";
import { REGISTRATION_ROUTE, SITE } from "@/config/site";
import type { Coordonnees } from "@/lib/parametres";

// Variante d'entrée du hero : chaque élément monte en cascade au chargement.
const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_INSTITUTIONAL } },
};

export function AccueilClassique({ coordonnees }: { coordonnees: Coordonnees }) {
  const { email, phone, socials } = coordonnees;
  const news = listLatestNews(3);
  const albums = listAlbums().slice(0, 3);
  const nextEvent = getNextEvent();

  return (
    <>
      {/* Hero — scène 3D en fond + contenu animé */}
      <section className="relative overflow-hidden">
        <ClientHeroScene />
        <div className="mx-auto max-w-[1240px] px-6 pb-14 pt-16 sm:pt-20">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={heroStagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="eyebrow" variants={heroItem}>
              {SITE.longName}
            </motion.p>
            <motion.h1
              className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink text-balance sm:text-5xl md:text-6xl"
              variants={heroItem}
            >
              Une communauté étudiante burkinabè, unie et solidaire en Tunisie.
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-[52ch] text-[15px] leading-relaxed text-muted-ink text-pretty"
              variants={heroItem}
            >
              L'AESBT accompagne les étudiants et stagiaires burkinabè dans leurs études, leur
              intégration et leur vie au quotidien, au service d'un collectif exigeant et humain.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
              variants={heroItem}
            >
              <ActionLink to={REGISTRATION_ROUTE}>Rejoindre l'association</ActionLink>
              <ActionLink to="/association" variant="secondary">
                Découvrir l'AESBT
              </ActionLink>
            </motion.div>
          </motion.div>

          <Reveal className="mt-12 sm:mt-14" delay={0.3}>
            <ParallaxMediaFrame
              ratio="aspect-[16/9]"
              className="mx-auto max-w-3xl"
              label="Photo officielle de l'association à venir"
            />
          </Reveal>
        </div>
      </section>

      {/* Présentation succincte */}
      <Section className="border-y border-line/70 bg-frost-deep/40">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-5" direction="right">
            <p className="eyebrow">L'association</p>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              Représenter et accompagner
            </h2>
          </Reveal>
          <Reveal className="md:col-span-7" direction="left" delay={0.1}>
            <p className="text-[15px] leading-relaxed text-muted-ink text-pretty">
              [Emplacement réservé à la présentation officielle de l'AESBT : missions, valeurs et
              champ d'action. Ce texte sera fourni par l'association.]
            </p>
            <Link
              href="/association"
              className="mt-6 inline-block text-[13px] font-semibold text-accent-blue underline-offset-4 hover:underline"
            >
              En savoir plus sur l'association
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Mot du Président */}
      <Section>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <ParallaxMediaFrame
              image={{ src: PRESIDENT_MESSAGE.photo.src, alt: PRESIDENT_MESSAGE.photo.alt }}
              ratio="aspect-[4/5]"
              label="Portrait du président à venir"
            />
          </div>
          <Reveal className="flex flex-col justify-center md:col-span-7" direction="left">
            <p className="eyebrow">Mot du Président</p>
            <blockquote className="mt-5 font-display text-2xl leading-snug text-ink-soft text-balance md:text-[28px]">
              {PRESIDENT_MESSAGE.message}
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-accent-blue" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {PRESIDENT_MESSAGE.name ?? "Nom à communiquer"}
                </p>
                <p className="text-[13px] text-muted-ink">{PRESIDENT_MESSAGE.role}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Actualités */}
      <Section className="border-t border-line/70">
        <SectionHeading
          eyebrow="Actualités"
          title="Les dernières nouvelles"
          action={{ label: "Toutes les actualités", to: "/actualites" }}
        />
        {news.length > 0 ? (
          <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <RevealItem key={article.id}>
                <NewsCard article={article} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyState
            className="mt-10"
            title="Aucune actualité publiée"
            description="Les publications de l'association apparaîtront ici."
          />
        )}
      </Section>

      {/* Prochain événement */}
      <section className="mx-auto max-w-[1240px] px-6 pb-16">
        <Reveal>
          <NextEventPanel event={nextEvent} />
        </Reveal>
      </section>

      {/* Statistiques */}
      <section className="border-y border-line/70 bg-frost-deep/40">
        <StatsRow stats={STATISTICS} />
      </section>

      {/* Galerie */}
      <Section>
        <SectionHeading
          eyebrow="Galerie"
          title="En images"
          action={{ label: "Toute la galerie", to: "/galerie" }}
        />
        <RevealGroup className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3" stagger={0.1}>
          {albums.map((album) => (
            <RevealItem key={album.id}>
              <AlbumCard album={album} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Contact / réseaux */}
      <Section className="border-t border-line/70 bg-frost-deep/40">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-6" direction="right">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              Rester en lien avec l'AESBT
            </h2>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted-ink text-pretty">
              Une question, une demande d'accompagnement ou un partenariat ? L'association reste
              joignable par ses canaux officiels.
            </p>
            <div className="mt-7">
              <ActionLink to="/contact" variant="dark">
                Nous écrire
              </ActionLink>
            </div>
          </Reveal>
          <Reveal className="md:col-span-6" direction="left" delay={0.1}>
            <dl className="grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-ink">E-mail</dt>
                <dd className="mt-1 text-ink">{email ?? "À communiquer"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-ink">
                  Téléphone
                </dt>
                <dd className="mt-1 text-ink">{phone ?? "À communiquer"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-ink">Réseaux</dt>
                <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-ink">
                  {socials.map((s) =>
                    s.href ? (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-blue hover:underline"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span key={s.label} className="text-muted-ink">
                        {s.label} (lien à venir)
                      </span>
                    ),
                  )}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
