"use client";

import Link from "next/link";
import {
  Fragment,
  type CSSProperties,
  type ImgHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cheminInterne } from "@/lib/chemin-interne";
import { texteDe, urlImage } from "./contenu";
import { useContenu, useContenus } from "./ContenusClient";
import { Editable, type TypeEditable } from "./Editable";

/**
 * Briques complémentaires de `<Editable>` pour les composants dont la balise
 * ne peut pas être remplacée (image avec ses attributs, lien Next, texte de
 * composant d'animation, élément framer-motion).
 *
 * Même principe que `<Editable>` : aucun wrapper en mode public (le DOM reste
 * identique à celui d'avant la migration) ; en mode édition, des attributs
 * `data-editable-*` et un clic qui sélectionne la zone. Le contour est un
 * `outline` posé par la feuille de style du provider : il ne touche jamais à
 * la mise en page (ni overflow, ni transform, ni position).
 */

/** Attributs de sélection à poser sur un élément (vides hors mode édition). */
export interface AttributsZone {
  "data-editable-cle"?: string;
  "data-editable-type"?: string;
  "data-editable-selectionne"?: "true" | undefined;
  tabIndex?: number;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
}

/** Attributs de sélection d'une clé : un objet vide hors mode édition. */
export function useAttributsZone(cle: string, type: TypeEditable): AttributsZone {
  const { modeEdition, cleSelectionnee, selectionner } = useContenus();
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
  return attributs;
}

/** Texte d'une clé, avec repli (pour les composants qui exigent une `string`). */
export function useTexte(cle: string, repli = ""): string {
  return texteDe(useContenu(cle), repli);
}

/**
 * Zone sélectionnable autour d'un contenu qu'on ne peut pas rendre via
 * `<Editable>` (ex. un composant d'animation qui exige une `string`).
 *
 * Hors mode édition : AUCUN wrapper (simple fragment). En mode édition : un
 * élément `as` portant les attributs de sélection.
 */
export function Zone({
  cle,
  type = "texte",
  as = "span",
  className,
  children,
}: {
  cle: string;
  type?: TypeEditable;
  as?: "span" | "div";
  className?: string;
  children: ReactNode;
}) {
  const { modeEdition } = useContenus();
  const attributs = useAttributsZone(cle, type);
  if (!modeEdition) return <Fragment>{children}</Fragment>;
  const Balise = as;
  return (
    <Balise {...attributs} className={className}>
      {children}
    </Balise>
  );
}

type PropsImage = {
  /** Clé de l'image (chemin public, URL ou identifiant de média). */
  cle: string;
  /** Clé du texte alternatif, si elle existe. */
  cleAlt?: string;
  /** Source utilisée quand la valeur est vide ou introuvable. */
  repli: string;
  /** Texte alternatif de repli (vide par défaut : image décorative). */
  altRepli?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

/**
 * `<img>` alimentée par une clé d'image. Les autres attributs (dimensions,
 * `fetchPriority`, classes, style) sont repris tels quels : le `alt` vient d'un
 * accesseur de valeur, pas de JSX.
 */
export function ImageEditable({ cle, cleAlt, repli, altRepli = "", ...reste }: PropsImage) {
  const { medias } = useContenus();
  const valeur = useContenu(cle);
  const valeurAlt = useContenu(cleAlt ?? "");
  const attributs = useAttributsZone(cle, "image");
  const src = urlImage(valeur, medias) ?? repli;
  const alt = cleAlt ? texteDe(valeurAlt, altRepli) : altRepli;
  return <img {...reste} {...attributs} src={src} alt={alt} />;
}

/**
 * Cible d'un lien du registre : chemin interne sûr ou URL http(s). Toute autre
 * valeur (schéma exotique, `//hote`) retombe sur le repli.
 */
export function hrefContenu(valeur: string, repli: string): string {
  if (/^https?:\/\//i.test(valeur)) return valeur;
  return cheminInterne(valeur, repli);
}

/**
 * Lien Next dont la cible (`cleLien`) et le libellé (`cleLibelle`) viennent du
 * registre. Le libellé est une zone à part (sélectionnable seule) ; le reste du
 * bouton sélectionne la cible. `children` reçoit ce qui suit le libellé (icône).
 */
export function LienEditable({
  cleLien,
  cleLibelle,
  repliLien,
  className,
  style,
  children,
}: {
  cleLien: string;
  cleLibelle: string;
  repliLien: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const valeur = texteDe(useContenu(cleLien), repliLien);
  const attributs = useAttributsZone(cleLien, "lien");
  const href = hrefContenu(valeur, repliLien);
  const externe = /^https?:\/\//i.test(href);

  return (
    <Link
      {...attributs}
      href={href}
      className={className}
      {...(style ? { style } : {})}
      {...(externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Editable cle={cleLibelle} />
      {children}
    </Link>
  );
}
