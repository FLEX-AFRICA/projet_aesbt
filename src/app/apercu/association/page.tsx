import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { AssociationContenu } from "@/app/association/_contenu";

/**
 * Aperçu de la page association pour l'éditeur visuel (phase 3).
 *
 * C'est la seule route dynamique du dispositif : elle lit le mode brouillon et
 * la session. Le site public (/association) reste statique. Sans mode
 * brouillon actif, on renvoie vers la page publique. Jamais indexée.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu : l'association",
  robots: { index: false, follow: false },
};

export default async function ApercuAssociationPage() {
  if (!(await draftMode()).isEnabled) redirect("/association");
  return <AssociationContenu apercu />;
}
