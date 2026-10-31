import { HistoriqueParagraphes } from "@/components/association/HistoriqueParagraphes";
import { MissionsGrille } from "@/components/association/MissionsGrille";
import { MotPresident } from "@/components/association/MotPresident";
import { Editable } from "@/components/editable/Editable";
import { ContenusProvider } from "@/components/editable/ContenusProvider";
import { MemberCard } from "@/components/cards/MemberCard";
import { AssociationHero } from "@/components/layout/AssociationHero";
import { Section } from "@/components/layout/PageHeader";
import { PatternBackdrop, type BackdropOptions } from "@/components/layout/PatternBackdrop";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SectionHeading } from "@/components/ui-aesbt/SectionHeading";
import { recupererAssociation } from "@/data/source";
import { CtaBand } from "@/components/hero-lab/CtaBand";

// Fond de la page : le même motif tuilé derrière la navbar, le hero et les
// sections. Pour changer le motif, remplacer `src` (fichier de `public/`).
// `mobileZoom` règle la taille du motif sur mobile (1 = identique, 0.6 = plus
// fin, 1.5 = plus gros) ; `scroll` et `mobileScroll` son défilement
// ("vertical", "horizontal" ou "none"). Voir `BackdropOptions`.
const BACKDROP: BackdropOptions = {
  src: "/white_background_13.jpg",
  tileSize: 230,
  mobileZoom: 1,
  scroll: "vertical",
  mobileScroll: "horizontal",
};

// Voile blanc sur les sections, sous les cartes (le hero reste en blanc plein).
const SECTIONS_VEIL = "bg-white/90";

// Carte en verre dépoli commune à toutes les sections : assez opaque pour
// garder le texte lisible, mais laisse deviner le baobab juste derrière.
const CARD =
  "rounded-2xl border border-line/60 bg-surface/75 backdrop-blur-md p-8 shadow-sm shadow-ink/5 sm:p-10";

/**
 * Corps de la page association, partagé par la page publique (statique) et la
 * route d'aperçu /apercu/association (dynamique, mode brouillon).
 *
 * `apercu` est la SEULE différence : il autorise `ContenusProvider` à lire le
 * mode brouillon, ce qui rend la route dynamique. Sans lui, aucun accès à
 * `draftMode()` ni aux cookies : la page publique reste statique (ISR).
 */
export async function AssociationContenu({ apercu = false }: { apercu?: boolean }) {
  const { membres } = await recupererAssociation();

  return (
    <ContenusProvider page="association" apercu={apercu}>
      {/* Le layout enveloppe nav et pied de page dans un provider `commun` : imbriqué ici, il est sans effet. */}
      <SiteLayout>
        {/*
        Le motif habille toute la page : posé une seule fois derrière la navbar
        (le conteneur remonte de la hauteur du `pt-28 sm:pt-32` de SiteLayout),
        le hero et les sections. `relative isolate` donne à l'arrière-plan
        (`absolute inset-0`) toute la hauteur de la page et enferme son z-index
        négatif dans cette zone : il ne passe jamais devant la nav ni le pied
        de page. Le hero garde un fond blanc plein ; les sections sont sous un
        voile blanc (`SECTIONS_VEIL`), avec des cartes en verre dépoli.
      */}
        <div className="relative isolate -mt-28 pt-28 sm:-mt-32 sm:pt-32">
          <PatternBackdrop {...BACKDROP} />

          <AssociationHero />

          <div className="relative">
            <div aria-hidden="true" className={`absolute inset-0 ${SECTIONS_VEIL}`} />
            <Section>
              <div className={`${CARD} grid gap-10 md:grid-cols-12`}>
                <div className="md:col-span-4">
                  <SectionHeading
                    eyebrow={<Editable cle="association.historique.etiquette" />}
                    title={<Editable cle="association.historique.titre" />}
                  />
                </div>
                <HistoriqueParagraphes />
              </div>
            </Section>

            <Section className="my-6 sm:my-10">
              <div className={CARD}>
                <SectionHeading
                  eyebrow={<Editable cle="association.missions.etiquette" />}
                  title={<Editable cle="association.missions.titre" />}
                />
                <MissionsGrille />
              </div>
            </Section>

            <Section className="my-6 sm:my-10">
              <div className={`${CARD} mx-auto max-w-3xl text-center`}>
                <MotPresident />
              </div>
            </Section>

            <Section className="">
              <div className={CARD}>
                <SectionHeading
                  eyebrow={<Editable cle="association.bureau.etiquette" />}
                  title={<Editable cle="association.bureau.titre" />}
                  description={<Editable cle="association.bureau.description" />}
                />
                <div className="mt-10 grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {membres.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            </Section>
          </div>

          <CtaBand />
        </div>
      </SiteLayout>
    </ContenusProvider>
  );
}
