import { FloatingNav } from "@/components/home/FloatingNav";
import { THEME_CLAIR } from "@/components/home/themes";
import { Footer } from "@/components/layout/Footer";
import { ScrollProvider } from "@/lib/animation/ScrollProvider";
import { HeroAurora } from "./HeroAurora";
import { ValuesBand } from "./ValuesBand";
import { CtaBand } from "./CtaBand";
import { MomentsStack } from "./MomentsStack";
import { ShowcaseBand } from "./ShowcaseBand";
import { FenetreBand } from "./FenetreBand";
import { HistoryBand } from "./HistoryBand";
import { ScienceBand } from "./ScienceBand";
import { AuroraSections, ContactBand } from "./AuroraSections";
import { NewsBand } from "./NewsBand";
import { SceneBlock } from "./SceneBlock";
import { MemberBand } from "./MemberBand";

/**
 * Page d'accueil immersive, construite sur la version 1.
 *
 * Enchaînement : hero (logo + photo cadrée), moments en cartes empilées,
 * bande « valeurs », mission, actualités, montage vidéo, lancement de la
 * rubrique « Fenêtre de l'étudiant », histoire de l'association,
 * cellule scientifique, appel à l'adhésion sur dégradé grainé (`CtaBand`,
 * qui a remplacé les chiffres clés), contact, puis le bloc « On t'accompagne,
 * pas à pas » (inchangé).
 */
export function AuroraPage() {
  return (
    <ScrollProvider>
      <div className="min-h-screen" style={{ backgroundColor: THEME_CLAIR.bg }}>
        <FloatingNav theme={THEME_CLAIR} />
        <main id="contenu">
          <HeroAurora />
          {/*<MomentsStack />*/}
          {/*<ValuesBand />*/}
          {/*<AuroraSections theme={THEME_CLAIR} />*/}
          <NewsBand />
          <ShowcaseBand />
          <FenetreBand />
          {/*<HistoryBand />*/}
          <ScienceBand />
          {/*<MemberBand />*/}
          <CtaBand />
          <ContactBand theme={THEME_CLAIR} />
          <SceneBlock />
        </main>
        <Footer />
      </div>
    </ScrollProvider>
  );
}
