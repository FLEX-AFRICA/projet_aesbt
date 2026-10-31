import { FloatingNav } from "@/components/home/FloatingNav";
import { HomeSections } from "@/components/home/HomeLanding";
import { THEME_CLAIR } from "@/components/home/themes";
import { Footer } from "@/components/layout/Footer";
import { HeroImmersif, type HeroLayout } from "./HeroImmersif";
import { SceneBlock } from "./SceneBlock";
import { LayoutSwitcher } from "./LabSwitcher";

/**
 * Page d'accueil (immersif). Hero mosaïque avec une disposition de contenu au
 * choix, puis le bloc « Scène » centré et les sections. Le sélecteur ne sert
 * plus qu'à comparer les 3 dispositions du hero.
 */
export function LabPage({ route, layout }: { route: string; layout: HeroLayout }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME_CLAIR.bg }}>
      <FloatingNav theme={THEME_CLAIR} />
      <main id="contenu">
        <HeroImmersif layout={layout} />
        <HomeSections theme={THEME_CLAIR} />
        <SceneBlock />
      </main>
      <Footer />
      <LayoutSwitcher current={route} />
    </div>
  );
}
