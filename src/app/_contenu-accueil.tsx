import { AuroraPage } from "@/components/hero-lab/AuroraPage";
import { ContenusProvider } from "@/components/editable/ContenusProvider";

/**
 * Corps de la page d'accueil, partagé par la page publique (statique) et la
 * route d'aperçu /apercu/accueil (dynamique, mode brouillon).
 *
 * `apercu` est la SEULE différence : il autorise `ContenusProvider` à lire le
 * mode brouillon, ce qui rend la route dynamique. Sans lui, aucun accès à
 * `draftMode()` ni aux cookies : la page publique reste statique (ISR). Les
 * clés `commun.*` sont fusionnées par le provider (bande d'adhésion, logo,
 * coordonnées).
 */
export function AccueilContenu({ apercu = false }: { apercu?: boolean }) {
  return (
    <ContenusProvider page="accueil" apercu={apercu}>
      <AuroraPage />
    </ContenusProvider>
  );
}
