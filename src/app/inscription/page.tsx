import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { CLASSE_LIEN } from "@/components/auth/styles";

import { FormulaireInscription } from "./FormulaireInscription";

const TITLE = "Inscription";
const DESCRIPTION =
  "Créez votre compte AESBT, association des étudiants et stagiaires burkinabè en Tunisie. Votre adhésion est ensuite validée par le bureau.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/inscription" },
  openGraph: {
    type: "website",
    url: "/inscription",
    title: `${TITLE} | AESBT Tunisie`,
    description: DESCRIPTION,
  },
};

export default function InscriptionPage() {
  return (
    <AuthShell
      panneau="droite"
      accroche={{
        titre: "Rejoignez la communauté AESBT",
        texte:
          "Étudiants et stagiaires burkinabè en Tunisie : entraide, événements et accompagnement, réunis au même endroit.",
      }}
    >
      <FormulaireInscription
        lienConnexion={
          <p className="animate-element animate-delay-800 mt-8 text-[14px] text-muted-ink">
            Déjà un compte ?{" "}
            <Link href="/connexion" className={CLASSE_LIEN}>
              Se connecter
            </Link>
          </p>
        }
      />
    </AuthShell>
  );
}
