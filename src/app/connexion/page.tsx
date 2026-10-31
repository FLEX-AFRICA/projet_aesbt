import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { CLASSE_LIEN } from "@/components/auth/styles";
import { cheminInterne } from "@/lib/destination";

import { FormulaireConnexion } from "./FormulaireConnexion";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;

  /*
   * Chemin demandé avant l'authentification, s'il est interne. À défaut, la
   * destination n'est pas connue ici : elle dépend du rôle, que seule l'API
   * peut dire, et le formulaire la détermine après la connexion.
   */
  const destination = cheminInterne(suite);

  return (
    <AuthShell
      panneau="gauche"
      titre="Connexion"
      description="Espace réservé aux membres de l'association. Votre compte doit avoir été validé par le bureau."
      accroche={{
        titre: "Retrouvez votre espace",
        texte:
          "Accédez à la Cellule Scientifique, à vos ressources et aux échanges de la communauté.",
      }}
    >
      <FormulaireConnexion suite={destination} />

      <p className="animate-element animate-delay-700 mt-8 text-[14px] text-muted-ink">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className={CLASSE_LIEN}>
          S'inscrire
        </Link>
      </p>
    </AuthShell>
  );
}
