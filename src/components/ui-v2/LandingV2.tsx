import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { chargerCoordonnees } from "@/lib/parametres";
import { Header } from "@/components/layout/Header";
import { CTA } from "./CTA";
import { Features } from "./Features";
import { FooterV2 } from "./FooterV2";
import { Gallery } from "./Gallery";
import { HeroV2 } from "./HeroV2";
import { Reveal } from "./Reveal";
import { Section, SectionHead, SectionJoin } from "./Section";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import { Timeline } from "./Timeline";

/**
 * Page d'accueil, refonte complète.
 *
 * Parti pris de performance, après la version précédente jugée trop lente :
 *  - aucun `filter: blur()` animé, aucun grand flou statique ;
 *  - aucune animation pilotée par la position de scroll (pas de `useScroll`,
 *    pas d'état React mis à jour à chaque frame) ;
 *  - pas de smooth scroll JS (Lenis) : le défilement natif est immédiat et ne
 *    coûte rien ;
 *  - les apparitions passent par `IntersectionObserver` + transitions CSS sur
 *    `opacity`/`transform` uniquement, et se débranchent après usage.
 *
 * L'en-tête est conservé tel quel, comme demandé. Il lit la progression de
 * scroll via `useScrollProgress`, qui renvoie 0 sans ScrollProvider : la barre
 * reste donc simplement affichée en permanence, ce qui est le comportement
 * voulu ici.
 */
export async function LandingV2() {
  const { socials } = await chargerCoordonnees();

  return (
    <div className="min-h-screen bg-frost">
      <Header />

      <main id="contenu">
        <HeroV2 />

        {/* MISSION + services */}
        <Section className="bg-frost">
          <SectionHead
            eyebrow="L'association"
            title="Un relais pour toute une communauté étudiante."
            lead="Installée à Tunis, l'AESBT fédère les étudiants et stagiaires burkinabè présents en Tunisie : elle facilite l'arrivée, défend leurs intérêts et anime la vie associative tout au long de l'année."
          />
          <Features />
        </Section>

        <SectionJoin from="frost" to="ink" />

        {/* CHIFFRES — bandeau sombre */}
        <Section className="bg-ink">
          <Stats />
        </Section>

        <SectionJoin from="ink" to="frost" />

        {/* PARCOURS */}
        <Section className="bg-frost">
          <SectionHead
            eyebrow="Le parcours"
            title="De l'aéroport au diplôme, jamais seul."
            lead="Chaque étape du séjour a ses démarches et ses incertitudes. L'association accompagne les quatre moments clés."
          />
          <Timeline />
        </Section>

        {/* TÉMOIGNAGES — fond légèrement contrasté */}
        <Section className="bg-frost-deep">
          <SectionHead
            eyebrow="Témoignages"
            title="Ce que vivent les membres."
            lead="Des parcours singuliers, une même communauté."
          />
          <Testimonials />
        </Section>

        {/* GALERIE & ÉVÉNEMENTS */}
        <Section className="bg-frost">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="À l'affiche"
              title="Ce qui anime l'association."
              lead="Temps forts patriotiques, rencontres sportives et moments de convivialité."
            />
            <Reveal delay={150}>
              <Link
                href="/actualites"
                className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent-red"
              >
                Toutes les actualités
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Reveal>
          </div>
          <Gallery />
        </Section>

        <CTA />
      </main>

      <FooterV2 socials={socials} />
    </div>
  );
}
