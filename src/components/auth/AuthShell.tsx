import Image from "next/image";
import type { ReactNode } from "react";

import { SiteLayout } from "@/components/layout/SiteLayout";

import { CLASSE_TITRE } from "./styles";

type Props = {
  /** Côté du panneau image sur écran large. Sur mobile il passe sous le formulaire. */
  panneau: "gauche" | "droite";
  /** Titre et description affichés au-dessus du contenu. Facultatifs (écran de succès). */
  titre?: string;
  description?: string;
  accroche: { titre: string; texte?: string };
  /**
   * Image du panneau. Par défaut le logo de l'association, affiché en entier
   * (`object-contain`). Toute autre image est affichée en `cover`.
   */
  heroImageSrc?: string;
  heroImageAlt?: string;
  children: ReactNode;
};

const LOGO = "/logo_aesbt.jpg";

/**
 * Page d'authentification dans l'ossature du site (navbar, pied de page) :
 * une carte centrée à deux colonnes sur écran large, empilées sur mobile.
 *
 * Le formulaire est premier dans le DOM : tabulation et lecteurs d'écran le
 * rencontrent avant le panneau décoratif. Seul l'ordre visuel change.
 */
export function AuthShell({
  panneau,
  titre,
  description,
  accroche,
  heroImageSrc = LOGO,
  heroImageAlt,
  children,
}: Props) {
  const gauche = panneau === "gauche";
  const logo = heroImageSrc === LOGO;
  const alt = heroImageAlt ?? (logo ? "Logo AESBT" : "");

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-ink/5 md:grid-cols-2">
          <section
            className={`flex flex-col justify-center p-6 sm:p-10 md:p-12 ${
              gauche ? "md:order-2" : "md:order-1"
            }`}
          >
            <div className="mx-auto w-full max-w-[440px]">
              {titre ? (
                <>
                  <h1 className={`animate-element animate-delay-100 ${CLASSE_TITRE}`}>{titre}</h1>
                  {description ? (
                    <p className="animate-element animate-delay-200 mt-3 text-[15px] leading-relaxed text-muted-ink">
                      {description}
                    </p>
                  ) : null}
                </>
              ) : null}
              {children}
            </div>
          </section>

          <aside
            className={`animate-slide-right animate-delay-300 relative isolate flex min-h-64 flex-col items-center justify-center overflow-hidden p-8 text-center md:min-h-[560px] ${
              gauche ? "md:order-1" : "md:order-2"
            } ${logo ? "bg-gradient-to-br from-accent-red/10 via-surface to-accent-green/10" : "bg-ink"}`}
          >
            {logo ? (
              <>
                <Image
                  src={heroImageSrc}
                  alt={alt}
                  width={320}
                  height={320}
                  priority
                  sizes="(min-width: 768px) 320px, 192px"
                  className="size-48 object-contain mix-blend-multiply md:size-72"
                />
                <p className="mt-4 font-display text-xl font-semibold tracking-tight text-ink text-balance md:text-2xl">
                  {accroche.titre}
                </p>
                {accroche.texte ? (
                  <p className="mt-2 hidden max-w-[36ch] text-[14px] leading-relaxed text-muted-ink sm:block">
                    {accroche.texte}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <Image
                  src={heroImageSrc}
                  alt={alt}
                  fill
                  sizes="(min-width: 768px) 550px, 100vw"
                  className="-z-10 object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10"
                />
                <div className="mt-auto text-white">
                  <p className="font-display text-xl font-semibold tracking-tight text-balance md:text-3xl">
                    {accroche.titre}
                  </p>
                  {accroche.texte ? (
                    <p className="mt-2 text-[14px] leading-relaxed text-white/90">
                      {accroche.texte}
                    </p>
                  ) : null}
                </div>
              </>
            )}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-red via-accent-gold to-accent-green"
            />
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
