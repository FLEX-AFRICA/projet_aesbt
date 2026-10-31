import LightboxGrid, { type LightboxImage } from "@/components/kokonutui/lightbox-grid";
import { PORTRAITS } from "./fenetre-facettes";
import { FenetreShell } from "./FenetreShell";

/**
 * Variante 2 : la galerie lightbox.
 *
 * Les portraits s'alignent en grille ; au clic, une vignette s'agrandit en
 * plein cadre avec sa légende, puis revient à sa place. On voit tout d'un
 * coup, et l'on entre dans le détail à la demande.
 */
const IMAGES: LightboxImage[] = PORTRAITS.map((p) => ({
  src: p.image,
  alt: p.name,
  width: 1600,
  height: 1067,
  caption: `${p.name} : ${p.highlight}`,
}));

export function FenetreBandGallery() {
  return (
    <FenetreShell caption="Touchez une vignette pour l'agrandir.">
      <div className="flex justify-center">
        <LightboxGrid images={IMAGES} />
      </div>
    </FenetreShell>
  );
}
