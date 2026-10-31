"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

import { THEME_CLAIR } from "@/components/home/themes";
import { PatternBackdrop, type BackdropOptions } from "@/components/layout/PatternBackdrop";
import { EmptyState } from "@/components/ui-aesbt/States";
import { formatDate } from "@/lib/format";

import type { GalleryEvent, GalleryPhoto } from "./vue";

const theme = THEME_CLAIR;
const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Fond de page réel, identique au `bg-frost` du layout commun (SiteLayout)
 * qui se trouve derrière la navbar flottante. `theme.bg` est un blanc
 * légèrement différent : l'utiliser ici créait un liséré visible juste sous
 * la navbar, là où le fond du layout laisse place à celui de la page.
 */
const PAGE_BG = "var(--color-frost)";

/** Motif tuilé en fond de la mosaïque, le même que sur la page événements. */
/**
 * Réglages du fond en motif tuilé (voir `BackdropOptions` pour toutes les
 * options) : `mobileZoom` règle la taille du motif sur mobile, `scroll` et
 * `mobileScroll` son sens de défilement ("vertical", "horizontal" ou "none").
 */
const BACKDROP: BackdropOptions = {
  src: "/white_background_4.jpg",
  tileSize: 230,
  mobileZoom: 1,
  scroll: "vertical",
};

/**
 * Page galerie : une mosaïque de photos (et non plus d'albums), puisque
 * chaque photo est reliée à l'événement où elle a été prise. Cliquer sur
 * une photo l'agrandit dans une visionneuse plein écran qui précise cet
 * événement, avec navigation au clavier ou aux flèches.
 */
export function GalleryLanding({
  events: galleryEvents,
  photos: galleryPhotos,
}: {
  events: GalleryEvent[];
  photos: GalleryPhoto[];
}) {
  const reduce = useReducedMotion();
  const [activeEvent, setActiveEvent] = useState<string | "Toutes">("Toutes");
  const [activeYear, setActiveYear] = useState<string | "Toutes">("Toutes");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const eventById = useMemo(
    () => new Map(galleryEvents.map((event) => [event.id, event])),
    [galleryEvents],
  );

  const years = useMemo(
    () =>
      Array.from(new Set(galleryEvents.map((event) => event.date.slice(0, 4)))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [galleryEvents],
  );

  // Les deux filtres se combinent (et non s'excluent) : une photo doit
  // correspondre à l'événement choisi ET à l'année choisie, quand les deux
  // sont renseignés.
  const photos = useMemo(
    () =>
      galleryPhotos.filter((photo) => {
        const event = eventById.get(photo.eventId);
        if (!event) return false;
        if (activeEvent !== "Toutes" && photo.eventId !== activeEvent) return false;
        if (activeYear !== "Toutes" && event.date.slice(0, 4) !== activeYear) return false;
        return true;
      }),
    [activeEvent, activeYear, eventById, galleryPhotos],
  );

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : undefined;
  const currentEvent = currentPhoto ? eventById.get(currentPhoto.eventId) : undefined;

  const goTo = (delta: 1 | -1) => {
    setLightboxIndex((index) => {
      if (index === null) return index;
      return (index + delta + photos.length) % photos.length;
    });
  };

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? i : (i + 1) % photos.length));
      else if (event.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, photos.length]);

  return (
    // SiteLayout met `pt-28 sm:pt-32` sur <main> pour laisser la place à la
    // navbar flottante : le fond de cette page démarre donc normalement sous
    // cette bande, sans jamais passer derrière la navbar. La marge négative
    // identique remonte ce conteneur (et son fond) jusqu'au tout en haut de
    // la page, et le `pt-28 sm:pt-32` repoussé sur le wrapper `z-10` restaure
    // la position du contenu visible.
    <div className="relative -mt-28 overflow-hidden sm:-mt-32" style={{ backgroundColor: PAGE_BG }}>
      <PatternBackdrop {...BACKDROP} />

      <div className="relative z-10 pt-28 sm:pt-32">
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-0 bg-white/100" />
          <GalleryHero
            reduce={reduce}
            events={galleryEvents}
            years={years}
            activeEvent={activeEvent}
            activeYear={activeYear}
            onChangeEvent={(value) => {
              setActiveEvent(value);
              setLightboxIndex(null);
            }}
            onChangeYear={(value) => {
              setActiveYear(value);
              setLightboxIndex(null);
            }}
          />
        </div>

        <div className="relative pt-6">
          <div aria-hidden="true" className="absolute inset-0 bg-white/80" />
          <div className="relative mx-auto max-w-[1280px] px-6 pb-20 sm:pb-28">
            {photos.length === 0 ? (
              <EmptyState
                title={
                  galleryPhotos.length === 0
                    ? "Aucune photo publiée pour le moment"
                    : "Aucune photo ne correspond à ces filtres"
                }
                description={
                  galleryPhotos.length === 0
                    ? "Les albums de l'association apparaîtront ici dès leur publication."
                    : "Essayez un autre événement ou une autre année."
                }
              />
            ) : (
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {photos.map((photo, index) => {
                  const event = eventById.get(photo.eventId);
                  return (
                    <Reveal reduce={reduce} delay={(index % 8) * 0.04} key={photo.id}>
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className="group relative mb-4 block w-full overflow-hidden rounded-2xl"
                        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                            {event ? formatDate(event.date) : ""}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold leading-snug text-white">
                            {event?.title}
                          </p>
                        </div>
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Lightbox
        photo={currentPhoto}
        event={currentEvent}
        index={lightboxIndex}
        total={photos.length}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => goTo(-1)}
        onNext={() => goTo(1)}
      />
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
 * posé section par section (90 % sur le hero, 80 % sur la mosaïque), chacune
 * ayant besoin d'une opacité différente.
 */

function GalleryHero({
  reduce,
  events,
  years,
  activeEvent,
  activeYear,
  onChangeEvent,
  onChangeYear,
}: {
  reduce: boolean | null;
  events: GalleryEvent[];
  years: string[];
  activeEvent: string | "Toutes";
  activeYear: string | "Toutes";
  onChangeEvent: (value: string | "Toutes") => void;
  onChangeYear: (value: string | "Toutes") => void;
}) {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-10 sm:pb-10 sm:pt-14">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 size-[420px] rounded-full blur-[130px]"
        style={{ backgroundColor: `${theme.green}18` }}
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
        <h1
          className="mx-auto max-w-[24ch] font-display text-[clamp(1.9rem,5.5vw,3.1rem)] font-semibold leading-[1.08] tracking-tight"
          style={{ color: theme.ink }}
        >
          Les moments de l'association, en images.
        </h1>
        <p
          className="mx-auto mt-5 max-w-[56ch] text-[15px] leading-relaxed"
          style={{ color: theme.inkSoft }}
        >
          Chaque photo est rattachée à l'événement où elle a été prise. Cliquez sur une image pour
          l'agrandir et découvrir son contexte.
        </p>

        {/* Deux menus déroulants compacts (événement + année), combinables,
            plutôt que des pilules : les titres d'événement sont trop longs
            pour tenir côte à côte sans s'empiler en plusieurs lignes, et un
            menu reste lisible et peu encombrant aussi bien sur mobile que
            sur desktop, sans avoir besoin de deux mises en page
            différentes. */}
        {events.length > 0 && (
          <div className="mx-auto mt-9 flex w-full max-w-sm items-center justify-center gap-2 sm:w-auto sm:max-w-none">
            <FilterSelect
              label="Filtrer par événement"
              value={activeEvent}
              onChange={onChangeEvent}
              options={[
                { value: "Toutes", label: "Tous les événements" },
                ...events.map((event) => ({ value: event.id, label: event.title })),
              ]}
            />
            <FilterSelect
              label="Filtrer par année"
              value={activeYear}
              onChange={onChangeYear}
              options={[
                { value: "Toutes", label: "Toutes les années" },
                ...years.map((year) => ({ value: year, label: year })),
              ]}
            />
          </div>
        )}
      </motion.div>
    </section>
  );
}

/**
 * Un des deux menus déroulants du filtre (événement, année), construit sur
 * Radix Select plutôt qu'un `<select>` natif : son rendu (notamment le menu
 * ouvert) dépend sinon entièrement du navigateur/OS, ce qui jure avec le
 * reste de l'habillage (pilule, police, coins arrondis). Même largeur fixe
 * que l'ancien select mobile, réutilisée sur tous les écrans.
 */
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        aria-label={label}
        className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full py-3 pl-4 pr-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-[15rem] sm:flex-initial"
        style={{ backgroundColor: `${theme.ink}08`, color: theme.ink }}
      >
        <SelectPrimitive.Value className="truncate" />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180"
            style={{ color: theme.inkSoft }}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl bg-white/95 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06] backdrop-blur-xl data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport className="max-h-72 p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-3 pr-8 text-[13px] font-medium outline-none data-[highlighted]:bg-black/[0.05]"
                style={{ color: theme.ink }}
              >
                <SelectPrimitive.ItemText className="truncate">
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex items-center">
                  <Check className="size-3.5" style={{ color: theme.green }} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function Lightbox({
  photo,
  event,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: GalleryPhoto | undefined;
  event: GalleryEvent | undefined;
  index: number | null;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <DialogPrimitive.Root open={photo !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/92 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-10"
        >
          {photo && (
            <>
              <DialogPrimitive.Title className="sr-only">
                {event?.title ?? "Photo de la galerie"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                Photo prise lors de l'événement {event?.title},{" "}
                {event ? formatDate(event.date) : ""}.
              </DialogPrimitive.Description>

              <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
              >
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{
                    aspectRatio: `${photo.width} / ${photo.height}`,
                    maxHeight: "72vh",
                  }}
                >
                  <Image
                    src={photo.fullSrc}
                    alt={photo.alt}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    priority
                  />
                </div>

                {photo.caption ? (
                  <p className="mt-4 w-full text-[14px] leading-relaxed text-white/90">
                    {photo.caption}
                  </p>
                ) : null}

                <div
                  className={`${photo.caption ? "mt-3" : "mt-4"} flex w-full items-center justify-between gap-4 text-white`}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                      {event ? formatDate(event.date) : ""}
                    </p>
                    <p className="mt-0.5 truncate text-[15px] font-semibold">
                      Prise lors de : {event?.title}
                    </p>
                  </div>
                  <p className="shrink-0 text-[12px] text-white/50">
                    {index !== null ? index + 1 : 0} / {total}
                  </p>
                </div>
              </div>

              <DialogPrimitive.Close
                aria-label="Fermer"
                className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-4" />
              </DialogPrimitive.Close>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    aria-label="Photo précédente"
                    className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    aria-label="Photo suivante"
                    className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
