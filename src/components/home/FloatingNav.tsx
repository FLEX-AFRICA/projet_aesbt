import { ContenusProvider } from "@/components/editable/ContenusProvider";
import { FloatingNavClient } from "./FloatingNavClient";
import type { HomeTheme } from "./themes";

/**
 * Barre de navigation flottante : enveloppe serveur de `FloatingNavClient`.
 *
 * Charge les contenus `commun` (libellés du bouton, logo) côté serveur, avec
 * le même mécanisme de revalidation que les pages (`src/lib/contenus.ts`), sans
 * rendre la page dynamique. Imbriquée sous le provider d'une page (accueil,
 * association), elle réutilise le contexte de la page, y compris en mode
 * édition. Les props sont de simples valeurs : utilisable partout où l'on
 * importait l'ancien `FloatingNav`, hors composants clients (ceux-ci reçoivent
 * la barre en prop ou utilisent `FloatingNavClient`).
 */
export function FloatingNav({ theme }: { theme: HomeTheme }) {
  return (
    <ContenusProvider page="commun">
      <FloatingNavClient theme={theme} />
    </ContenusProvider>
  );
}
