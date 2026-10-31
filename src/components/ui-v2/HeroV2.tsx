import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { REGISTRATION_ROUTE } from "@/config/site";
import { AESBT_PHOTOS } from "@/components/home/themes";
import { Reveal } from "./Reveal";

/**
 * Hero : photo du collectif, titre, deux actions.
 *
 * Choix de performance : la photo est posée une seule fois, sans duplication
 * floutée derrière (la version précédente en affichait deux, dont une
 * `blur-2xl` agrandie — très coûteux à peindre en plein écran). La netteté est
 * gérée autrement : `object-position` cadre sur le groupe, et un dégradé
 * sombre côté gauche porte le texte. La source étant limitée (1040 × 694), on
 * ne cherche plus à remplir un écran entier avec elle : elle est cadrée en
 * bandeau, hauteur contenue, là où elle reste nette.
 */
export function HeroV2() {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* Photo de fond, cadrée sur le haut (les visages). */}
      <img
        src={AESBT_PHOTOS.staff}
        alt="Les membres de l'AESBT réunis lors d'un événement de l'association."
        // fetchPriority: c'est l'image qui décide du LCP, on la veut en premier.
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-[50%_28%]"
      />

      {/* Lisibilité : dégradés statiques (aucun coût d'animation). Celui de
          gauche porte le texte, celui du bas raccorde à la section suivante. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="relative mx-auto flex min-h-[78vh] max-w-[1240px] flex-col justify-center px-6 py-24 sm:min-h-[82vh]">
        <Reveal className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-frost/20 bg-frost/10 px-3 py-1.5 text-[12px] font-medium text-frost">
            <MapPin size={13} strokeWidth={2} aria-hidden="true" />
            Tunis, Tunisie — depuis le Burkina Faso
          </span>
        </Reveal>

        <Reveal delay={80} className="max-w-3xl">
          <h1 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-frost text-balance sm:text-5xl md:text-6xl">
            Étudier loin de chez soi, sans jamais être seul.
          </h1>
        </Reveal>

        <Reveal delay={150} className="max-w-xl">
          <p className="mt-5 text-[15px] leading-relaxed text-frost/75 text-pretty sm:text-base">
            L'Association des Étudiants et Stagiaires Burkinabè en Tunisie accueille, représente et
            accompagne sa communauté — des démarches d'arrivée à la réussite du diplôme.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={REGISTRATION_ROUTE}
              className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-6 py-3.5 text-[14px] font-semibold text-frost transition-colors hover:bg-accent-red/90"
            >
              Rejoindre l'association
              <ArrowRight
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/association"
              className="inline-flex items-center rounded-full border border-frost/25 px-6 py-3.5 text-[14px] font-semibold text-frost transition-colors hover:bg-frost/10"
            >
              Découvrir l'AESBT
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
