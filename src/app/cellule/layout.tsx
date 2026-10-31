import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BoutonDeconnexion } from "@/components/layout/BoutonDeconnexion";
import { ShellEspace, type BasculeEspace, type ConfigEspace } from "@/components/espace";
import { sessionCourante } from "@/lib/api-admin";

import { basculeVersAdministration } from "./_bascule";

export const metadata: Metadata = {
  title: { default: "Cellule Scientifique", template: "%s | Cellule Scientifique" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Navigation de la cellule, avec le lien de bascule éventuel vers l'administration. */
function espaceCellule(bascule: BasculeEspace | null): ConfigEspace {
  return {
    nom: "Cellule Scientifique",
    libelleNavigation: "Sections de la cellule",
    ...(bascule ? { bascule } : {}),
    groupes: [
      {
        titre: "Mon espace",
        couleur: "rouge",
        liens: [
          { href: "/cellule", libelle: "Accueil", icone: "accueil", exact: true },
          { href: "/cellule/profil", libelle: "Mon profil", icone: "profil" },
          { href: "/cellule/notifications", libelle: "Notifications", icone: "notifications" },
        ],
      },
      {
        titre: "Mentorat",
        couleur: "vert",
        liens: [
          { href: "/cellule/mentors", libelle: "Trouver un mentor", icone: "mentors" },
          { href: "/cellule/mentorat", libelle: "Mon mentorat", icone: "mentorat" },
        ],
      },
      {
        titre: "Communauté",
        couleur: "encre",
        liens: [
          { href: "/cellule/poles", libelle: "Pôles", icone: "poles" },
          {
            href: "/cellule/communaute",
            libelle: "Ressources partagées",
            icone: "partage",
          },
        ],
      },
      {
        titre: "Ressources",
        couleur: "or",
        liens: [{ href: "/cellule/ressources", libelle: "Mes ressources", icone: "ressources" }],
      },
    ],
  };
}

/** Écran explicite pour chaque état de compte qui bloque l'accès. */
function Message({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-[52ch]">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">{titre}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-ink">{texte}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/" className="text-[13px] font-semibold text-accent-blue hover:underline">
            Retour à l'accueil du site
          </Link>
          <BoutonDeconnexion />
        </div>
      </div>
    </div>
  );
}

export default async function CelluleLayout({ children }: { children: ReactNode }) {
  const session = await sessionCourante();

  if (!session) {
    redirect("/connexion?suite=/cellule");
  }

  /*
   * `sessionCourante` interroge /api/v1/me, qui exige déjà un compte validé :
   * un compte en attente n'obtient donc pas de session ici. Ce contrôle sert
   * à expliquer la situation plutôt qu'à renvoyer vers la connexion en
   * boucle.
   */
  if (session.statut === "en_attente") {
    return (
      <Message
        titre="Votre inscription est en cours d'examen"
        texte="Le bureau doit valider votre compte avant que vous puissiez accéder à la Cellule Scientifique. Vous recevrez un e-mail dès que ce sera fait."
      />
    );
  }

  if (session.statut === "refuse") {
    return (
      <Message
        titre="Votre inscription n'a pas été retenue"
        texte="Le motif vous a été communiqué par e-mail. Si vous pensez qu'il s'agit d'une erreur, écrivez au Bureau Exécutif depuis la page de contact."
      />
    );
  }

  if (session.statut === "suspendu") {
    return (
      <Message
        titre="Votre compte est suspendu"
        texte="Vous ne pouvez plus accéder à la Cellule Scientifique. Pour comprendre cette décision ou la contester, écrivez au Bureau Exécutif depuis la page de contact."
      />
    );
  }

  if (session.statut !== "valide") {
    return (
      <Message
        titre="Accès indisponible"
        texte="Votre compte ne permet pas d'accéder à la Cellule Scientifique pour le moment."
      />
    );
  }

  return (
    <ShellEspace
      espace={espaceCellule(basculeVersAdministration(session))}
      utilisateur={{
        nom: session.nom,
        email: session.email,
        roleLibelle:
          session.role === "admin"
            ? "Administrateur"
            : session.role === "mentor"
              ? "Mentor"
              : session.role === "editeur"
                ? "Éditeur"
                : "Étudiant",
      }}
    >
      {children}
    </ShellEspace>
  );
}
