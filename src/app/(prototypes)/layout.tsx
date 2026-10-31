import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Groupe de routes « prototypes ».
 *
 * Explorations de design conservées pour arbitrage. Le nom entre parenthèses
 * est un groupe Next : il n'apparaît pas dans les URL, qui restent /version-1,
 * /anim-lab, etc.
 *
 * Toutes ces pages sont en noindex : elles ne doivent ni être référencées ni
 * apparaître dans le plan du site. Voir legacy-routes/README.md et le point 8
 * de la section 5 de docs/PLAN.md.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrototypesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
