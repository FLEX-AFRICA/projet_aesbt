"use client";

import {
  ArrowRight,
  Atom,
  BrainCircuit,
  Building2,
  Cog,
  FlaskConical,
  HeartPulse,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { Editable } from "@/components/editable/Editable";
import { useContenu, useContenus } from "@/components/editable/ContenusClient";
import { elementsDe, texteDe, urlImage } from "@/components/editable/contenu";
import { LienEditable, useAttributsZone } from "@/components/editable/ZoneEditable";
import { ScrollZoomReveal, type CircuitNode } from "@/components/motion/ScrollZoomReveal";

/** Le vert de la cellule : pistes du circuit, pastilles, boutons. */
const GREEN = "#2E7D4F";

/**
 * Icônes des pôles : le registre stocke un identifiant (champ `icon`), le
 * composant Lucide (non sérialisable) est retrouvé ici. Identifiant inconnu :
 * la fiole des sciences.
 */
const ICONES: Record<string, LucideIcon> = {
  batiment: Building2,
  industriel: Cog,
  sante: HeartPulse,
  economie: LineChart,
  data: BrainCircuit,
  sciences: FlaskConical,
};

/** Ratio de la vignette à l'origine (2048 x 1378), si la valeur du registre est invalide. */
const RATIO_DEFAUT = 2048 / 1378;

/**
 * Section « Cellule scientifique ».
 *
 * Toute la section tient dans un seul plan de défilement : la vignette
 * incrustée dans le titre enfle, la phrase s'écarte, puis le circuit se trace
 * depuis le média et les six pôles paraissent au bout de leurs pistes. On ne
 * défile donc pas pour voir une image, on découvre la cellule.
 *
 * Les pôles sont le contenu de ce plan, pas son décor : chaque pièce porte son
 * intitulé complet et les filières qu'elle réunit, en texte, lisible par les
 * lecteurs d'écran comme par les moteurs. Il n'y a volontairement pas de liste
 * qui les répète ensuite : le défilement les a déjà présentés.
 *
 * Sur ordinateur, le nom de la cellule, la phrase d'accroche et le bouton
 * paraissent tous les trois en légende, juste sous le média épinglé : tout le
 * contenu de la section se voit donc avec l'animation, sans qu'il faille
 * défiler plus bas pour le découvrir. Sur téléphone, où le plan se joue plus
 * court et où ce bloc empiéterait sur les pièces, la légende reste une simple
 * phrase.
 *
 * Attention à ne pas poser `overflow-hidden` sur la section : le plan repose
 * sur un élément épinglé, qu'un conteneur de défilement intermédiaire
 * empêcherait de tenir.
 */
export function ScienceBand() {
  const { medias } = useContenus();
  const titreDebut = texteDe(useContenu("accueil.science.titre_debut"), "La cellule");
  const titreFin = texteDe(useContenu("accueil.science.titre_fin"), "scientifique");
  const srcMedia = urlImage(useContenu("accueil.science.media"), medias) ?? "/picture-11.jpg";
  const altMedia = texteDe(
    useContenu("accueil.science.media_alt"),
    "Étudiants et stagiaires de l'AESBT réunis",
  );
  // Le ratio doit suivre l'image : valeur invalide ou nulle, ratio d'origine.
  const brutRatio = useContenu("accueil.science.media_ratio");
  const ratio =
    typeof brutRatio === "number" && Number.isFinite(brutRatio) && brutRatio > 0
      ? brutRatio
      : RATIO_DEFAUT;
  const brutPoles = useContenu("accueil.science.poles");

  const zoneTitreDebut = useAttributsZone("accueil.science.titre_debut", "texte");
  const zoneTitreFin = useAttributsZone("accueil.science.titre_fin", "texte");
  const zoneMedia = useAttributsZone("accueil.science.media", "image");
  const zonePoles = useAttributsZone("accueil.science.poles", "liste");

  const poles: CircuitNode[] = elementsDe(brutPoles)
    .map((el, index) => ({
      pole: {
        name: texteDe(el["name"]),
        fields: texteDe(el["fields"]),
        icon: ICONES[texteDe(el["icon"])] ?? FlaskConical,
      },
      index,
    }))
    .map(({ pole, index }) => ({
      id: `pole-${index}`,
      node: (layout) =>
        layout === "stack" ? (
          // Sur téléphone, la pièce n'est plus un bloc mais une ligne : la
          // pastille à gauche, l'intitulé et les filières à droite. Le nom tient
          // alors sur une seule ligne, et les filières restent lisibles au lieu
          // d'être supprimées faute de place.
          <article
            {...zonePoles}
            className="flex size-full items-center gap-3 overflow-hidden rounded-2xl border border-[#2E7D4F]/15 bg-white px-3 text-left shadow-[0_10px_24px_-16px_rgba(20,40,30,0.4)]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#2E7D4F]/10 text-[#2E7D4F]">
              <pole.icon className="size-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <h3 className="truncate font-display text-[14px] font-semibold leading-tight tracking-tight text-[#1A1A1A]">
                {pole.name}
              </h3>
              <p className="mt-1 truncate text-[11.5px] leading-tight text-[#6B6B6B]">
                {pole.fields}
              </p>
            </span>
          </article>
        ) : (
          // De côté, les six pièces ont le même gabarit. L'intitulé y réserve
          // toujours deux lignes, qu'il en remplisse une ou deux : les filières
          // partent donc de la même hauteur d'une pièce à l'autre, et aucune ne
          // paraît plus petite que sa voisine.
          <article
            {...zonePoles}
            className="flex size-full flex-col justify-center gap-2 overflow-hidden rounded-2xl border border-[#2E7D4F]/15 bg-white p-3 text-left shadow-[0_14px_34px_-18px_rgba(20,40,30,0.45)] lg:gap-2.5 lg:p-4"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#2E7D4F]/10 text-[#2E7D4F] lg:size-9">
              <pole.icon className="size-4 lg:size-4.5" strokeWidth={1.75} />
            </span>
            <h3 className="min-h-[2.75em] font-display text-[12.5px] font-semibold leading-snug tracking-tight text-[#1A1A1A] lg:text-[14px]">
              {pole.name}
            </h3>
            <p className="text-[11px] leading-snug text-[#6B6B6B] lg:text-[12px]">{pole.fields}</p>
          </article>
        ),
    }));

  return (
    <section className="relative bg-[#F3F1EC]">
      {/* Le plan : le média enfle, puis le circuit relie les six pôles. */}
      <ScrollZoomReveal
        before={titreDebut}
        after={titreFin}
        media={{ kind: "image", src: srcMedia, alt: altMedia }}
        aspect={ratio}
        zones={{ before: zoneTitreDebut, after: zoneTitreFin, media: zoneMedia }}
        nodes={poles}
        hub={0.42}
        accent={GREEN}
        caption={
          <>
            {/* Téléphone : la cellule reste en colonne, sous les pièces, une
                simple phrase de légende. */}
            <Editable cle="accueil.science.legende_mobile" className="md:hidden" />
            {/* Ordinateur : tout le contenu de la section (le nom de la
                cellule, la phrase et le bouton) paraît ici, juste sous le
                média, pour se voir avec le circuit plutôt qu'après lui. */}
            <span className="hidden flex-col items-center gap-5 md:flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2E7D4F]/20 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#2E7D4F]">
                <Atom className="size-3.5" strokeWidth={2} />
                <Editable cle="accueil.science.badge" />
              </span>
              <Editable
                cle="accueil.science.phrase"
                type="texte_long"
                className="text-[15px] leading-relaxed text-[#5A4A42] lg:text-[16px]"
              />
              <LienEditable
                cleLien="accueil.science.cta_lien"
                cleLibelle="accueil.science.cta_libelle"
                repliLien="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-[#2E7D4F] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(46,125,79,0.22)] transition-transform hover:-translate-y-0.5"
              >
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </LienEditable>
            </span>
          </>
        }
        textClassName="font-display text-[clamp(2.4rem,11vw,3.4rem)] font-semibold leading-[1.02] tracking-tight text-[#1A1A1A] md:text-[clamp(1.5rem,5.6vw,3.9rem)] md:leading-[1.05]"
        track={300}
      />
    </section>
  );
}
