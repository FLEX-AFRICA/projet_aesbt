import type { ReactNode } from "react";
import { FloatingNav } from "@/components/home/FloatingNav";
import { THEME_CLAIR } from "@/components/home/themes";
import { Footer } from "./Footer";
import { ScrollProvider } from "@/lib/animation/ScrollProvider";

/**
 * Ossature commune à toutes les pages internes : en-tête, contenu, pied de
 * page.
 *
 * L'en-tête est la même navbar flottante (`FloatingNav`) que la page
 * d'accueil, pour une seule identité de navigation sur tout le site. Comme
 * elle flotte au-dessus du contenu plutôt que de le pousser, le contenu
 * reçoit une marge haute (`pt-28`) pour ne jamais passer dessous.
 *
 * Navbar et pied de page chargent eux-mêmes les contenus `commun` (provider
 * serveur propre, sans effet sous celui d'une page) : ce layout convient donc
 * aux pages sans provider comme à celles qui en ont un.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ScrollProvider>
      <div className="flex min-h-screen flex-col bg-frost">
        <FloatingNav theme={THEME_CLAIR} />
        <main id="contenu" className="flex-1 pt-28 sm:pt-32">
          {children}
        </main>
        <Footer />
      </div>
    </ScrollProvider>
  );
}
