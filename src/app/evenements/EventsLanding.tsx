"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, CalendarDays, Images, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { THEME_CLAIR } from "@/components/home/themes";
import { PatternBackdrop, type BackdropOptions } from "@/components/layout/PatternBackdrop";
import { EmptyState } from "@/components/ui-aesbt/States";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { EventView } from "./vue";

const theme = THEME_CLAIR;
const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Fond de page réel, identique au `bg-frost` du layout commun (SiteLayout)
 * qui se trouve derrière la navbar flottante. `theme.bg` est un blanc
 * légèrement différent : l'utiliser ici créait un liséré visible juste sous
 * la navbar, là où le fond du layout laisse place à celui de la page.
 */
const PAGE_BG = "var(--color-frost)";

/** Motif tuilé derrière la section du programme (carré, donc répétable sans déformation). */
/**
 * Réglages du fond en motif tuilé (voir `BackdropOptions` pour toutes les
 * options) : `mobileZoom` règle la taille du motif sur mobile, `scroll` et
 * `mobileScroll` son sens de défilement ("vertical", "horizontal" ou "none").
 */
const BACKDROP: BackdropOptions = {
  src: "/white_background_3.jpg",
  tileSize: 230,
  mobileZoom: 1,
  scroll: "vertical",
};

const FILTERS = [
  { id: "toutes", label: "Tous les événements" },
  { id: "a-venir", label: "À venir" },
  { id: "passe", label: "Terminés" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

/**
 * Page événements : un hero plein format avec une photo de l'association en
 * fond, puis le programme classé par statut (à venir / terminé), dans le
 * même langage visuel que les pages ressources et galerie.
 */
export function EventsLanding({ events: allEvents }: { events: EventView[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<FilterId>("toutes");

  const events = useMemo(
    () => (filter === "toutes" ? allEvents : allEvents.filter((event) => event.status === filter)),
    [allEvents, filter],
  );

  const featured = allEvents.find((event) => event.status === "a-venir");

  return (
    // SiteLayout met `pt-28 sm:pt-32` sur <main> pour laisser la place à la
    // navbar flottante : la marge négative identique remonte ce conteneur (et
    // son motif) jusqu'au tout en haut de la page, pour qu'il reste visible
    // sous la navbar, comme sur la page galerie. Le `pt-28 sm:pt-32` repoussé
    // sur le wrapper `z-10` restaure la position du contenu visible.
    <div className="relative -mt-28 overflow-hidden sm:-mt-32" style={{ backgroundColor: PAGE_BG }}>
      <PatternBackdrop {...BACKDROP} />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-white/10 sm:h-32" />

      <div className="relative z-10 pt-28 sm:pt-32">
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-0 bg-white" />
          <Hero reduce={reduce} />
        </div>

        <div className="relative">
          <div aria-hidden="true" className="absolute inset-0 bg-white/86" />
          <div className="relative mx-auto max-w-[1180px] px-6 py-16 sm:py-24">
            {allEvents.length === 0 ? (
              <EmptyState
                title="Aucun événement au programme pour le moment"
                description="Les prochaines rencontres de l'association seront annoncées ici dès leur publication."
              />
            ) : (
              <>
                {featured && (
                  <Reveal reduce={reduce}>
                    <FeaturedEvent event={featured} />
                  </Reveal>
                )}

                <div className="mt-14 flex flex-wrap items-center justify-center gap-1 sm:mt-16">
                  <div
                    className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full p-1.5 backdrop-blur-sm"
                    style={{ backgroundColor: `${theme.bg}CC` }}
                  >
                    {FILTERS.map((option) => {
                      const isActive = filter === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFilter(option.id)}
                          aria-pressed={isActive}
                          className="relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
                          style={{ color: isActive ? theme.onAccent : theme.inkSoft }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="events-filter-pill"
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: theme.accent }}
                              transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {events.length === 0 ? (
                  <EmptyState
                    className="mt-10"
                    title="Aucun événement dans cette catégorie"
                    description="Choisissez un autre filtre pour voir le reste du programme."
                  />
                ) : (
                  <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event, index) => (
                      <Reveal reduce={reduce} delay={(index % 6) * 0.05} key={event.id}>
                        <EventCard event={event} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Motif tuilé en parallax, placé derrière toute la page (hero compris), sur
 * toute sa hauteur. On tuile le motif plutôt que d'étirer une seule image :
 * il reste net quelle que soit la taille de la section, sans avoir à zoomer
 * ni recadrer.
 *
 * Le voile blanc qui le rend lisible derrière le texte n'est pas ici : il est
 * posé section par section (plein sur le hero, 95 % sur le programme),
 * chacune ayant besoin d'une opacité différente.
 */

/**
 * Hero dans le même langage visuel que les pages ressources et galerie :
 * fond clair du site, halos de couleur en arrière-plan, titre centré avec
 * un trait d'accent tracé à main levée sous un mot clé.
 */
function Hero({ reduce }: { reduce: boolean | null }) {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-20 sm:pb-20 sm:pt-28">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 size-[420px] rounded-full blur-[130px]"
        style={{ backgroundColor: `${theme.accent}14` }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-24 size-[360px] rounded-full blur-[130px]"
        style={{ backgroundColor: `${theme.gold}18` }}
      />

      <motion.div
        className="relative mx-auto max-w-[1180px] px-6 text-center"
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: theme.accent }}
        >
          Événements
        </p>
        <h1
          className="mx-auto mt-4 max-w-[22ch] font-display text-[clamp(1.9rem,5.5vw,3.1rem)] font-semibold leading-[1.08] tracking-tight"
          style={{ color: theme.ink }}
        >
          Le{" "}
          <span className="relative inline-block whitespace-nowrap">
            programme
            <TitleStroke color={theme.accent} />
          </span>{" "}
          de l'association.
        </h1>
        <p
          className="mx-auto mt-5 max-w-[56ch] text-[15px] leading-relaxed"
          style={{ color: theme.inkSoft }}
        >
          Rencontres, conférences, sorties et moments conviviaux : tout ce que l'AESBT organise pour
          sa communauté, à venir ou déjà vécu.
        </p>
      </motion.div>
    </section>
  );
}

/** Trait tracé à main levée sous un mot du titre, pour porter l'accent. */
function TitleStroke({ color }: { color: string }) {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 10"
      fill="none"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.12em] left-0 h-[0.18em] w-full overflow-visible"
      style={{ color }}
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
        transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
      />
    </svg>
  );
}

function FeaturedEvent({ event }: { event: EventView }) {
  return (
    <div
      className="grid overflow-hidden rounded-3xl backdrop-blur-sm sm:grid-cols-5"
      style={{ backgroundColor: `${theme.bg}E6` }}
    >
      {event.image && (
        <div className="relative aspect-[16/10] sm:col-span-2 sm:aspect-auto">
          <Image
            src={event.image.featured}
            alt={event.image.alt}
            fill
            sizes="(min-width: 640px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div
        className={
          event.image
            ? "flex flex-col justify-center gap-4 p-8 sm:col-span-3 sm:p-10"
            : "flex flex-col justify-center gap-4 p-8 sm:col-span-5 sm:p-10"
        }
      >
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ backgroundColor: `${theme.accent}16`, color: theme.accent }}
          >
            Prochain événement
          </span>
          {event.category && (
            <span className="text-[13px] font-medium" style={{ color: theme.inkSoft }}>
              {event.category}
            </span>
          )}
        </div>
        <h2
          className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
          style={{ color: theme.ink }}
        >
          {event.title}
        </h2>
        {event.description && (
          <p className="max-w-[52ch] text-[15px] leading-relaxed" style={{ color: theme.inkSoft }}>
            {event.description}
          </p>
        )}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]"
          style={{ color: theme.inkSoft }}
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(event.date)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {event.location}
            </span>
          )}
        </div>
        {event.registrationUrl && (
          <a
            href={event.registrationUrl}
            className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent, color: theme.onAccent }}
          >
            S'inscrire
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
        <PhotosEvenement event={event} />
      </div>
    </div>
  );
}

/**
 * Section « Photos » d'un événement : bouton vers chaque album publié de la
 * galerie et/ou lien externe (Google Drive). Rien n'est rendu sans photos.
 */
function PhotosEvenement({ event }: { event: EventView }) {
  if (event.albums.length === 0 && !event.photosUrl) return null;

  return (
    <div className="mt-1 flex flex-col gap-2" style={{ color: theme.inkSoft }}>
      <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]">
        <Images className="size-3.5" aria-hidden="true" />
        Photos
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold">
        {event.albums.map((album) => (
          <Link
            key={album.slug}
            href={`/galerie/${album.slug}`}
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
            style={{ color: theme.accent }}
          >
            {event.albums.length > 1 ? `Voir l'album ${album.title}` : "Voir l'album photo"}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        ))}
        {event.photosUrl && (
          <a
            href={event.photosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
            style={{ color: theme.accent }}
          >
            Voir les photos sur Google Drive
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventView }) {
  const isPast = event.status === "passe";

  return (
    <article
      id={`evenement-${event.slug}`}
      className={cn(
        "scroll-mt-32 group flex h-full flex-col overflow-hidden rounded-2xl backdrop-blur-sm transition-opacity",
        isPast && "opacity-80",
      )}
      style={{ backgroundColor: `${theme.bg}E6` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.image ? (
          <Image
            src={event.image.card}
            alt={event.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
              isPast && "grayscale",
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center"
            style={{ backgroundColor: `${theme.accent}10`, color: theme.inkSoft }}
          >
            <CalendarDays className="size-8 opacity-50" />
          </div>
        )}
        {event.category && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
            style={{ backgroundColor: theme.bg, color: theme.ink }}
          >
            {event.category}
          </span>
        )}
        {isPast && (
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
            Terminé
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: theme.inkSoft }}
        >
          {formatDate(event.date)}
        </p>
        <h3
          className="font-display text-lg font-semibold leading-snug tracking-tight"
          style={{ color: theme.ink }}
        >
          {event.title}
        </h3>
        <p
          className="line-clamp-2 flex-1 text-[14px] leading-relaxed"
          style={{ color: theme.inkSoft }}
        >
          {event.description}
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          {event.location ? (
            <span
              className="inline-flex min-w-0 items-center gap-1.5 truncate text-[12.5px]"
              style={{ color: theme.inkSoft }}
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          ) : (
            <span />
          )}
          {!isPast && event.registrationUrl && (
            <a
              href={event.registrationUrl}
              className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold"
              style={{ color: theme.accent }}
            >
              S'inscrire
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
        <PhotosEvenement event={event} />
      </div>
    </article>
  );
}

function Reveal({
  children,
  reduce,
  delay = 0,
}: {
  children: ReactNode;
  reduce: boolean | null;
  delay?: number;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
