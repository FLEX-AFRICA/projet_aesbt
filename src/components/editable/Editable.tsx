"use client";

import {
  createElement,
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import type { ValeurContenu } from "@/contenus/defauts";
import { elementsDe, texteDe, urlImage } from "./contenu";
import { useContenus } from "./ContenusClient";

/**
 * Zones éditables. Aucun `dangerouslySetInnerHTML` : les valeurs sont rendues
 * en texte brut par React.
 *
 * Pièges de l'inventaire (§6) pris en compte :
 * - 6.7 / 6.8 : pas de wrapper ajouté. `<Editable as="h1">` REND la balise
 *   elle-même (le `h1` est l'élément éditable), donc pas de `div` dans un `p`,
 *   pas de boîte en plus dans un flex/grid, pas de rupture de `ref` ni de
 *   `variants` framer-motion. Le contour est un `outline` posé par feuille de
 *   style (jamais overflow/transform/position), compatible `position: sticky`.
 * - 6.8 : un lien parent ne doit pas naviguer quand on sélectionne en mode
 *   édition (`preventDefault`). Valeur nulle ou vide : repli (`repli`).
 * - 6.6 : composant client, mais les props (clé, classe, balise) sont
 *   sérialisables : une page serveur peut l'utiliser directement. Les fonctions
 *   de rendu (`children`, `renderItem`) ne traversent PAS la frontière
 *   serveur vers client : à utiliser depuis un composant client.
 * - 6.1 / 6.2 : pour un composant d'animation qui exige une `string`
 *   (CinematicText...), utiliser `useContenu` / `texteDe` et passer la chaîne,
 *   en enveloppant le composant dans une zone éditable via `children`.
 * - 6.3 : les clés React des listes sont l'index (aucun id dans les valeurs).
 */

type BaliseTexte =
  "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "blockquote" | "li" | "a" | "figure";

export type TypeEditable = "texte" | "texte_long" | "lien" | "image" | "liste";

interface AttributsZone {
  "data-editable-cle"?: string;
  "data-editable-type"?: string;
  "data-editable-selectionne"?: "true" | undefined;
  tabIndex?: number;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
}

function useZone(cle: string, type: TypeEditable) {
  const { contenus, medias, modeEdition, cleSelectionnee, selectionner } = useContenus();
  const valeur = contenus[cle];

  const attributs: AttributsZone = {};
  if (modeEdition) {
    attributs["data-editable-cle"] = cle;
    attributs["data-editable-type"] = type;
    attributs["data-editable-selectionne"] = cleSelectionnee === cle ? "true" : undefined;
    attributs.tabIndex = 0;
    attributs.onClick = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      selectionner(cle);
    };
    attributs.onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectionner(cle);
      }
    };
  }
  return { valeur, medias, modeEdition, attributs };
}

interface PropsEditable {
  cle: string;
  /** Balise rendue (par défaut `span`). */
  as?: BaliseTexte | "img";
  className?: string;
  /** Défaut `texte`. `texte_long` conserve les retours à la ligne. */
  type?: TypeEditable;
  /** Texte de repli quand la valeur est nulle ou vide. */
  repli?: string;
  /** Texte alternatif (type image, balise `img`). */
  alt?: string;
  /**
   * Rendu personnalisé du contenu de la balise à partir de la valeur
   * (composants clients uniquement). Sans lui : le texte brut de la valeur.
   */
  children?: (valeur: ValeurContenu | undefined) => ReactNode;
}

/**
 * Rend la valeur d'une clé dans la balise `as`.
 *
 * Hors mode édition : un simple élément avec la classe et le texte, rien de
 * plus. En mode édition : attributs `data-editable-*`, contour au survol et à
 * la sélection, clic qui prévient l'éditeur par postMessage.
 */
export function Editable({
  cle,
  as = "span",
  className,
  type = "texte",
  repli,
  alt,
  children,
}: PropsEditable) {
  const { valeur, medias, modeEdition, attributs } = useZone(cle, type);
  const classes =
    type === "texte_long"
      ? [className, "whitespace-pre-line"].filter(Boolean).join(" ")
      : className;

  if (as === "img") {
    const src = urlImage(valeur, medias) ?? urlImage(repli);
    if (!src) return null;
    return createElement("img", { ...attributs, src, alt: alt ?? "", className });
  }

  const texte = texteDe(valeur, repli ?? "");
  const contenuRendu = children ? children(valeur) : texte;

  // Public : élément vide sans repli = rien à afficher (pas de titre vide).
  if (!modeEdition && !children && texte === "") return null;

  const props: AttributsZone & { className?: string | undefined; href?: string | undefined } = {
    ...attributs,
    className: classes,
  };
  if (type === "lien" && as === "a") props.href = texte || undefined;

  return createElement(as, props, contenuRendu);
}

interface PropsListe<T extends Record<string, string | number | null>> {
  cle: string;
  as?: "div" | "ul" | "ol" | "section" | "span";
  className?: string;
  /** Liste purement décorative (masquée aux lecteurs d'écran). */
  ariaHidden?: boolean;
  /** Rendu d'un élément. Aucune clé à fournir : l'index sert de clé. */
  renderItem: (element: T, index: number) => ReactNode;
}

/**
 * Liste de valeurs (missions, statistiques...) dont le rendu de chaque
 * élément est délégué à l'appelant. En mode édition, un clic sur n'importe
 * quel élément sélectionne la liste entière (clé de la liste).
 */
export function EditableListe<T extends Record<string, string | number | null>>({
  cle,
  as = "div",
  className,
  ariaHidden,
  renderItem,
}: PropsListe<T>) {
  const { valeur, attributs } = useZone(cle, "liste");
  const elements = elementsDe(valeur) as T[];

  return createElement(
    as,
    { ...attributs, className, ...(ariaHidden ? { "aria-hidden": true } : {}) },
    elements.map((element, index) => <Fragment key={index}>{renderItem(element, index)}</Fragment>),
  );
}
