"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Image01Icon, Pdf01Icon } from "@hugeicons/core-free-icons";
import type { ComponentType, ReactNode } from "react";

import AnimatedListComponent from "@/components/AnimatedList";
import { PatternBackdrop, type BackdropOptions } from "@/components/layout/PatternBackdrop";
import { THEME_CLAIR } from "@/components/home/themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui-aesbt/States";
import { RESOURCE_CATEGORIES, type Resource, type ResourceCategory } from "@/types/content";
import { ContactBand } from "@/components/hero-lab/AuroraSections";

const theme = THEME_CLAIR;
const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Fond de page réel, identique au `bg-frost` du layout commun (SiteLayout)
 * qui se trouve derrière la navbar flottante. `theme.bg` est un blanc
 * légèrement différent : l'utiliser ici créait un liséré visible juste sous
 * la navbar, là où le fond du layout laisse place à celui de la page.
 */
const PAGE_BG = "var(--color-frost)";

/**
 * Motif tuilé en parallax derrière la page, dans l'esprit de celui des
 * Actualités mais propre à cette page : motifs géométriques inspirés du
 * bogolan (étoffe de boue) d'Afrique de l'Ouest, dessinés pour le site (SVG
 * carrés, donc répétables sans couture). Pour en changer, remplacer le
 * chemin : "/patterns/bogolan.svg" (zigzags, losanges, barres) ou
 * "/patterns/soleil.svg" (soleils et lignes).
 */
const BACKDROP: BackdropOptions = {
  src: "white_background_10.jpg",
  tileSize: 240,
  // Réglages mobile : zoom du motif (1 = identique) et sens de défilement
  // ("vertical", "horizontal" ou "none"). Voir `BackdropOptions`.
  mobileZoom: 1,
  scroll: "vertical",
};

/**
 * Voile blanc posé sur le fond, sous la section des dossiers (hero exclu,
 * qui reste en blanc plein). Classe Tailwind d'opacité : `bg-white/80` =
 * fond à peine visible, `bg-white/50` = fond bien visible. À ajuster ici.
 */
const FOLDERS_VEIL = "bg-white/90";

/**
 * Folder.jsx n'a pas de types stricts (comme CircularCarousel.jsx) : on le détype ici.
 * Il mesure le vrai DOM et dessine sur un canvas WebGL (couleur, devicePixelRatio...),
 * donc il n'a rien de valide à produire côté serveur : on le charge uniquement côté client.
 */
const Folder = dynamic(() => import("@/components/Folder"), {
  ssr: false,
}) as unknown as ComponentType<Record<string, unknown>>;

/** AnimatedList.jsx n'a pas de types stricts non plus : même détypage que Folder. */
const AnimatedList = AnimatedListComponent as unknown as ComponentType<Record<string, unknown>>;

const FOLDER_COLORS = [theme.accent, theme.gold, theme.green];

/**
 * Le dossier 3D (Folder.jsx) anime chaque document comme une vraie feuille :
 * au-delà de quelques documents, elles se chevauchent et débordent, surtout
 * sur mobile. Sous ce seuil (variable selon la largeur d'écran), on ouvre le
 * dossier normalement ; au-delà, on bascule sur une liste défilante
 * (AnimatedList), qui reste lisible quel que soit le nombre de documents.
 */
const FOLDER_THRESHOLD_MOBILE = 3;
const FOLDER_THRESHOLD_DESKTOP = 4;
const DESKTOP_QUERY = "(min-width: 640px)";

/**
 * Nombre de puces de filtre immédiatement visibles avant de devoir passer
 * par le bouton "Filtres". Au-delà de 6 catégories sur desktop, le bouton
 * prendra aussi le relais là-bas, pas seulement sur mobile.
 */
const FILTERS_QUICK_MOBILE = 3;
const FILTERS_QUICK_DESKTOP = 6;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

type FileKind = "pdf" | "docx" | "image";

const KIND_META: Record<FileKind, { label: string; bg: string; fg: string }> = {
  pdf: { label: "PDF", bg: `${theme.accent}16`, fg: theme.accent },
  docx: { label: "DOC", bg: "#2457C016", fg: "#2457C0" },
  image: { label: "IMG", bg: `${theme.green}16`, fg: theme.green },
};

const KIND_ICON: Record<FileKind, typeof Pdf01Icon> = {
  pdf: Pdf01Icon,
  docx: File01Icon,
  image: Image01Icon,
};

type MockDocument = {
  id: string;
  title: string;
  category: ResourceCategory;
  kind: FileKind;
  meta: string;
};

/**
 * Données fictives, pour visualiser le rendu en attendant le vrai catalogue
 * de documents (PDF, DOCX, images) rendus publics par l'association.
 */
const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: "doc-1",
    title: "Guide d'inscription universitaire",
    category: "Étudier en Tunisie",
    kind: "pdf",
    meta: "1,8 Mo",
  },
  {
    id: "doc-21",
    title: "Guide general",
    category: "Étudier en Tunisie",
    kind: "pdf",
    meta: "3,8 Mo",
  },
  {
    id: "doc-2",
    title: "Modèle de lettre de motivation",
    category: "Étudier en Tunisie",
    kind: "docx",
    meta: "84 Ko",
  },
  {
    id: "doc-23",
    title: "Modèle de lettre de motivation",
    category: "Étudier en Tunisie",
    kind: "docx",
    meta: "84 Ko",
  },
  {
    id: "doc-3",
    title: "Plan des campus partenaires",
    category: "Étudier en Tunisie",
    kind: "image",
    meta: "3,1 Mo",
  },
  {
    id: "doc-4",
    title: "Guide du logement étudiant",
    category: "Vie pratique",
    kind: "pdf",
    meta: "2,2 Mo",
  },
  {
    id: "doc-5",
    title: "Liste des pharmacies partenaires",
    category: "Vie pratique",
    kind: "pdf",
    meta: "412 Ko",
  },
  {
    id: "doc-6",
    title: "Carte des transports utiles",
    category: "Vie pratique",
    kind: "image",
    meta: "2,0 Mo",
  },
  {
    id: "doc-7",
    title: "Statuts de l'association",
    category: "Documents AESBT",
    kind: "pdf",
    meta: "640 Ko",
  },
  {
    id: "doc-8",
    title: "Procès-verbal, assemblée générale 2025",
    category: "Documents AESBT",
    kind: "docx",
    meta: "96 Ko",
  },
  {
    id: "doc-9",
    title: "Rapport moral 2025",
    category: "Documents AESBT",
    kind: "pdf",
    meta: "1,1 Mo",
  },
  {
    id: "doc-10",
    title: "Appel à candidatures, bourse d'excellence",
    category: "Opportunités",
    kind: "pdf",
    meta: "720 Ko",
  },
  {
    id: "doc-11",
    title: "Offre de stage, ambassade du Burkina",
    category: "Opportunités",
    kind: "docx",
    meta: "58 Ko",
  },
  { id: "doc-12", title: "Foire aux questions", category: "FAQ", kind: "pdf", meta: "300 Ko" },
];

/**
 * Page ressources, dans la même langue visuelle que l'accueil : bandes
 * rythmées, étiquettes, révélations au scroll. Les documents officiels
 * (PDF, DOCX, images) sont rangés par thématique dans des dossiers (Folder)
 * qu'on ouvre pour en voir le contenu, comme on fouillerait un vrai classeur.
 *
 * `resources` (le vrai catalogue) est reçu mais pas encore affiché ici : en
 * attendant un vrai lot de documents, l'affichage se base sur
 * `MOCK_DOCUMENTS`, des valeurs fictives demandées pour prévisualiser le
 * rendu (dossiers et filtre).
 */
export function ResourcesLanding({ resources: _resources }: { resources: Resource[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<ResourceCategory | "Toutes">("Toutes");

  const counts = useMemo(() => {
    const map = new Map<ResourceCategory, number>();
    MOCK_DOCUMENTS.forEach((doc) => map.set(doc.category, (map.get(doc.category) ?? 0) + 1));
    return map;
  }, []);

  const byCategory = useMemo(() => {
    return RESOURCE_CATEGORIES.map((category) => ({
      category,
      items: MOCK_DOCUMENTS.filter((doc) => doc.category === category),
    }))
      .filter((group) => group.items.length > 0)
      .filter((group) => active === "Toutes" || group.category === active);
  }, [active]);

  return (
    <div style={{ backgroundColor: PAGE_BG }}>
      {/*
        Le `<main>` de SiteLayout porte déjà un `pt-28 sm:pt-32` (pour passer
        sous la navbar flottante). On remonte le fond ici de la même valeur
        (`-mt-28 sm:-mt-32`) puis on la redonne juste en dessous, pour que le
        motif en parallax s'étende bien derrière le header, comme sur la page
        Actualités.
      */}
      <div className="relative -mt-28 overflow-hidden sm:-mt-32">
        <PatternBackdrop {...BACKDROP} />

        <div className="relative z-10 pt-28 sm:pt-32">
          <ResourcesHero reduce={reduce} active={active} onChange={setActive} counts={counts} />

          {/* DOSSIERS PAR THÉMATIQUE */}
          <section className="relative">
            <div aria-hidden="true" className={`absolute inset-0 ${FOLDERS_VEIL}`} />
            <div className="relative mx-auto max-w-[1180px] px-6 py-16 sm:py-24">
              {byCategory.length > 0 ? (
                <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
                  {byCategory.map(({ category, items }, i) => (
                    <Reveal reduce={reduce} delay={i * 0.06} key={category}>
                      <FolderGroup
                        category={category}
                        items={items}
                        color={
                          FOLDER_COLORS[
                            RESOURCE_CATEGORIES.indexOf(category) % FOLDER_COLORS.length
                          ] ?? theme.accent
                        }
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <EmptyState
                  className="mt-10"
                  title="Aucune ressource dans cette catégorie"
                  description="De nouvelles ressources seront publiées prochainement."
                />
              )}
            </div>
          </section>
        </div>
      </div>
      <ContactBand theme={THEME_CLAIR} />
    </div>
  );
}

/**
 * Le dossier 3D reste affiché partout, identique visuellement. Sous le
 * seuil (3 documents sur mobile, 4 à partir de "sm"), un clic l'ouvre
 * normalement : tous les documents tiennent dans l'animation. Au-delà,
 * l'ouverture physique n'a plus de sens (feuilles qui débordent) : le
 * dossier reste fermé et un clic ouvre plutôt une popup listant tous les
 * documents (AnimatedList), qui absorbe n'importe quelle quantité sans
 * jamais casser l'affichage.
 */
function FolderGroup({
  category,
  items,
  color,
}: {
  category: ResourceCategory;
  items: MockDocument[];
  color: string;
}) {
  const isDesktop = useIsDesktop();
  const threshold = isDesktop ? FOLDER_THRESHOLD_DESKTOP : FOLDER_THRESHOLD_MOBILE;
  const overflowing = items.length > threshold;
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-center">
      <Folder
        label={category}
        color={color}
        paperColor="#FCFAF6"
        theme="light"
        size={1.05}
        {...(overflowing
          ? {
              open: false,
              onOpenChange: (next: boolean) => {
                if (next) setPopupOpen(true);
              },
            }
          : {})}
      >
        {items.map((doc) => (
          <FileCard key={doc.id} title={doc.title} kind={doc.kind} meta={doc.meta} />
        ))}
      </Folder>
      {/* Nom de la catégorie sous le dossier : l'onglet du dossier est trop
          petit pour être lisible, le nombre de documents passe en second. */}
      <h3
        className="mt-6 text-center font-display text-[1.15rem] font-semibold leading-tight tracking-tight"
        style={{ color: theme.ink }}
      >
        {category}
      </h3>
      <p
        className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: theme.inkSoft }}
      >
        {items.length} document{items.length > 1 ? "s" : ""}
      </p>

      {overflowing && (
        <DocumentsDialog
          open={popupOpen}
          onOpenChange={setPopupOpen}
          category={category}
          items={items}
          color={color}
        />
      )}
    </div>
  );
}

/** Popup listant tous les documents d'une catégorie trop chargée pour le dossier 3D. */
function DocumentsDialog({
  open,
  onOpenChange,
  category,
  items,
  color,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ResourceCategory;
  items: MockDocument[];
  color: string;
}) {
  const listItems = items.map((doc) => ({
    id: doc.id,
    icon: <HugeiconsIcon icon={KIND_ICON[doc.kind]} size={18} strokeWidth={1.8} />,
    title: doc.title,
    description: KIND_META[doc.kind].label,
    meta: doc.meta,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[420px] gap-5 rounded-3xl border-0 p-6 shadow-2xl sm:p-7"
        style={{ backgroundColor: theme.bg }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[17px]" style={{ color: theme.ink }}>
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            {category}
          </DialogTitle>
          <DialogDescription style={{ color: theme.inkSoft }}>
            {items.length} documents
          </DialogDescription>
        </DialogHeader>
        <AnimatedList
          items={listItems}
          theme="light"
          accentColor={color}
          width="100%"
          maxHeight={420}
          radius={14}
          gap={8}
          stagger={0.04}
          fadeSize={40}
          frame
          showGradients
          displayScrollbar={false}
          selectOnHover
          enableArrowNavigation
        />
      </DialogContent>
    </Dialog>
  );
}

/**
 * En-tête de la page, dans l'esprit du hero d'actualités : fond crème,
 * halos discrets, grand titre centré avec un trait tracé à main levée, puis
 * le filtre juste dessous, comme un sélecteur de segment animé.
 */
function ResourcesHero({
  reduce,
  active,
  onChange,
  counts,
}: {
  reduce: boolean | null;
  active: ResourceCategory | "Toutes";
  onChange: (value: ResourceCategory | "Toutes") => void;
  counts: Map<ResourceCategory, number>;
}) {
  const filters = ["Toutes", ...RESOURCE_CATEGORIES] as const;

  return (
    <section className="relative isolate overflow-hidden pb-14 sm:pb-20">
      <div aria-hidden="true" className="absolute inset-0 bg-white" />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 size-[420px] rounded-full blur-[130px]"
        style={{ backgroundColor: `${theme.gold}1a` }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-24 size-[360px] rounded-full blur-[130px]"
        style={{ backgroundColor: `${theme.accent}14` }}
      />

      <motion.div
        className="relative mx-auto max-w-[1180px] px-6 text-center pt-10"
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <h1
          className="mx-auto max-w-[22ch] font-display text-[clamp(1.9rem,5.5vw,3.1rem)] font-semibold leading-[1.08] tracking-tight"
          style={{ color: theme.ink }}
        >
          Les documents{" "}
          <span className="relative inline-block whitespace-nowrap">
            officiels
            <TitleStroke color={theme.accent} />
          </span>{" "}
          de l'association.
        </h1>
        <p
          className="mx-auto mt-5 max-w-[56ch] text-[15px] leading-relaxed"
          style={{ color: theme.inkSoft }}
        >
          Guides pratiques, statuts, comptes rendus et opportunités : tout ce que l'AESBT rend
          public, classé par thématique et prêt à être consulté.
        </p>

        <FilterBar filters={filters} active={active} onChange={onChange} counts={counts} />
      </motion.div>
    </section>
  );
}

/**
 * Rangée de filtres : "Toutes" et les premières catégories restent toujours
 * visibles en puces, tout de suite cliquables. Dès qu'il y en a trop pour la
 * largeur disponible (mobile, ou desktop si la liste s'allonge), le reste
 * se cache derrière un bouton "Filtres" explicite, bien plus repérable
 * qu'un contenu qu'il faudrait découvrir en faisant défiler la rangée.
 */
function FilterBar({
  filters,
  active,
  onChange,
  counts,
}: {
  filters: readonly ("Toutes" | ResourceCategory)[];
  active: ResourceCategory | "Toutes";
  onChange: (value: ResourceCategory | "Toutes") => void;
  counts: Map<ResourceCategory, number>;
}) {
  const isDesktop = useIsDesktop();
  const [dialogOpen, setDialogOpen] = useState(false);
  const quickLimit = isDesktop ? FILTERS_QUICK_DESKTOP : FILTERS_QUICK_MOBILE;
  const hasOverflow = filters.length > quickLimit;
  const quickFilters = filters.slice(0, quickLimit);
  const visibleFilters = !hasOverflow
    ? filters
    : quickFilters.includes(active)
      ? quickFilters
      : [...filters.slice(0, Math.max(0, quickLimit - 1)), active];
  const hiddenCount = Math.max(0, filters.length - quickLimit);

  const countOf = (filter: "Toutes" | ResourceCategory) =>
    filter === "Toutes"
      ? Array.from(counts.values()).reduce((sum, value) => sum + value, 0)
      : (counts.get(filter) ?? 0);

  return (
    <div className="mx-auto mt-9 flex max-w-full flex-wrap items-center justify-center gap-1.5">
      <div
        className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full p-1.5"
        style={{ backgroundColor: `${theme.ink}08` }}
      >
        {visibleFilters.map((filter) => {
          const isActive = active === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onChange(filter)}
              aria-pressed={isActive}
              className="relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
              style={{ color: isActive ? theme.onAccent : theme.inkSoft }}
            >
              {isActive && (
                <motion.span
                  layoutId="resources-filter-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10">
                {filter}
                <span className="ml-1.5 opacity-70">{countOf(filter)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {hasOverflow && (
        <>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium"
            style={{ backgroundColor: `${theme.ink}08`, color: theme.ink }}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            Filtres
            {hiddenCount > 0 && <span className="opacity-60">+{hiddenCount}</span>}
          </button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent
              className="max-w-[380px] gap-5 rounded-3xl border-0 p-6 shadow-2xl"
              style={{ backgroundColor: theme.bg }}
            >
              <DialogHeader>
                <DialogTitle style={{ color: theme.ink }}>Filtrer par catégorie</DialogTitle>
                <DialogDescription style={{ color: theme.inkSoft }}>
                  Choisis une thématique pour affiner les documents affichés.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const isActive = active === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        onChange(filter);
                        setDialogOpen(false);
                      }}
                      aria-pressed={isActive}
                      className="rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: isActive ? theme.accent : `${theme.ink}08`,
                        color: isActive ? theme.onAccent : theme.inkSoft,
                      }}
                    >
                      {filter}
                      <span className="ml-1.5 opacity-70">{countOf(filter)}</span>
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function FileCard({ title, kind, meta }: { title: string; kind: FileKind; meta: string }) {
  const m = KIND_META[kind];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 px-3 text-center">
      <span
        className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[0.08em]"
        style={{ backgroundColor: m.bg, color: m.fg }}
      >
        {m.label}
      </span>
      <span
        className="text-[12px] font-semibold leading-snug"
        style={{ color: "var(--folder-paper-ink-strong)" }}
      >
        {title}
      </span>
      <span className="text-[10px]" style={{ color: "var(--folder-paper-ink)" }}>
        {meta}
      </span>
    </div>
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
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
