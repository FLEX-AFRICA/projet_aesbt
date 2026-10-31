import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PastilleIconePole } from "./PastilleIconePole";

/**
 * Carte d'un pôle, sur le modèle des pièces de la cellule scientifique de
 * l'accueil : carte blanche arrondie, bordure verte, pastille d'icône, nom en
 * police d'affichage et filières en gris.
 *
 * La carte entière mène au pôle par un seul lien (le nom, étiré sur toute la
 * carte). Le menu d'actions et les pastilles passent au-dessus du lien
 * (`relative z-10`) sans être imbriqués dedans.
 */
export function CartePole({
  nom,
  description,
  icone,
  href,
  pastilles,
  menu,
  signal = false,
  discret = false,
  indication = "Entrer dans le pôle",
}: {
  nom: string;
  /** Filières du pôle. */
  description: string | null;
  /** Clé d'icône de l'API. */
  icone: string | null | undefined;
  href: string;
  /** États du pôle (actif, demandes, statut), affichés sous le texte. */
  pastilles?: ReactNode;
  /** Menu d'actions en haut à droite (client), facultatif. */
  menu?: ReactNode;
  /** Met la bordure en évidence (demandes à traiter, adhésion). */
  signal?: boolean;
  /** Atténue la carte (pôle inactif). */
  discret?: boolean;
  /** Texte de l'appel à l'action en pied de carte. */
  indication?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-2xl border bg-white p-4 shadow-[0_10px_24px_-16px_rgba(20,40,30,0.4)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(20,40,30,0.45)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-[#2E7D4F] has-[a:focus-visible]:ring-offset-2 sm:p-5",
        signal ? "border-[#C9961B]/60" : "border-[#2E7D4F]/15",
        discret && "bg-white/70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <PastilleIconePole icone={icone} className={cn(discret && "opacity-60")} />
        {menu ? <div className="relative z-10 -mr-1 -mt-1">{menu}</div> : null}
      </div>

      <div className="min-w-0">
        <h2 className="font-display text-[17px] font-semibold leading-snug tracking-tight text-[#1A1A1A]">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            {nom}
          </Link>
        </h2>
        <p className="mt-1.5 text-[13px] leading-snug text-[#6B6B6B]">
          {description || "Aucune description."}
        </p>
      </div>

      {pastilles ? <div className="flex flex-wrap items-center gap-2">{pastilles}</div> : null}

      <span
        aria-hidden="true"
        className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-[#2E7D4F]"
      >
        {indication}
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2}
        />
      </span>
    </div>
  );
}
