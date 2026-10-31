import { ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { urlVignette } from "../_commun/medias";

/**
 * Carte d'un album : couverture, titre, date et pastilles. La carte entière
 * mène à l'album par un seul lien (le titre, étiré sur toute la carte) ; le
 * menu d'actions passe au-dessus (`relative z-10`) sans être imbriqué dedans.
 * Modèle visuel : CartePole.
 */
export function CarteAlbum({
  titre,
  date,
  couverture,
  href,
  pastilles,
  menu,
  discret = false,
}: {
  titre: string;
  /** Date déjà formatée. */
  date: string;
  /** Chemin du média de couverture. */
  couverture: string | null;
  href: string;
  pastilles?: ReactNode;
  menu?: ReactNode;
  discret?: boolean;
}) {
  const url = urlVignette(couverture);
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2E7D4F]/15 bg-white shadow-[0_10px_24px_-16px_rgba(20,40,30,0.4)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(20,40,30,0.45)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-[#2E7D4F] has-[a:focus-visible]:ring-offset-2",
        discret && "bg-white/70",
      )}
    >
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-frost text-muted-ink">
        {url ? (
          <img src={url} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-8" />
        )}
        {menu ? <div className="absolute right-2 top-2 z-10">{menu}</div> : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-semibold leading-snug tracking-tight text-[#1A1A1A]">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
            >
              {titre}
            </Link>
          </h2>
          <p className="mt-1 text-[13px] text-[#6B6B6B]">{date}</p>
        </div>

        {pastilles ? <div className="flex flex-wrap items-center gap-2">{pastilles}</div> : null}

        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-[#2E7D4F]"
        >
          Gérer les photos
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </span>
      </div>
    </div>
  );
}
