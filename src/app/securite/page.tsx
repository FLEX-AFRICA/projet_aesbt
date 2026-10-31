import { redirect } from "next/navigation";

import { sessionCourante } from "@/lib/api-admin";

import { ActivationDeuxFacteurs } from "./ActivationDeuxFacteurs";

export const metadata = {
  title: "Sécurité du compte",
  robots: { index: false, follow: false },
};

/*
 * Volontairement hors du layout /admin : cet écran doit rester atteignable
 * par un administrateur qui n'a PAS encore activé la double authentification,
 * or c'est précisément ce que le layout refuse. L'y placer créerait une
 * boucle.
 */

export default async function SecuritePage() {
  const session = await sessionCourante();

  if (!session) redirect("/connexion?suite=/securite");

  if (session.doubleAuthentification) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto min-h-screen max-w-[760px] px-6 py-16">
      <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
        Activer la double authentification
      </h1>
      <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-muted-ink">
        L'administration l'exige. Ce n'est pas une formalité : votre compte peut valider des
        inscriptions, modérer des contenus et en supprimer. S'il est compromis, c'est l'association
        entière qui l'est.
      </p>
      <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-muted-ink">
        Il vous faut une application d'authentification sur votre téléphone : Aegis, Google
        Authenticator ou équivalent.
      </p>

      <ActivationDeuxFacteurs />
    </div>
  );
}
