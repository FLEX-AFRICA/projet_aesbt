import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BoutonDeconnexion } from "@/components/layout/BoutonDeconnexion";
import { DROITS_EDITEUR, cheminDuDroit, droitRequis } from "@/components/droits/catalogue";
import { ShellEspace, type ConfigEspace } from "@/components/espace";
import { sessionCourante } from "@/lib/api-admin";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration AESBT" },
  // L'administration n'a rien à faire dans un moteur de recherche.
  robots: { index: false, follow: false },
};

/*
 * Rendu à chaque requête : une page d'administration mise en cache
 * afficherait des données périmées, et pourrait exposer à un visiteur le
 * contenu rendu pour un administrateur.
 */
export const dynamic = "force-dynamic";

const BASCULE_CELLULE = {
  href: "/cellule",
  libelle: "Cellule Scientifique",
  icone: "cellule",
} as const;

/** Navigation de l'administration, regroupée par catégories. */
const ESPACE_ADMIN: ConfigEspace = {
  nom: "Administration",
  libelleNavigation: "Sections d'administration",
  bascule: BASCULE_CELLULE,
  groupes: [
    {
      titre: "Pilotage",
      couleur: "rouge",
      liens: [
        { href: "/admin", libelle: "Tableau de bord", icone: "tableauDeBord", exact: true },
        { href: "/admin/statistiques", libelle: "Statistiques", icone: "statistiques" },
      ],
    },
    {
      titre: "Contenu",
      couleur: "vert",
      liens: [
        { href: "/admin/editeur", libelle: "Éditeur visuel", icone: "editeur" },
        { href: "/admin/publications", libelle: "Publications", icone: "publications" },
        { href: "/admin/galerie", libelle: "Galerie", icone: "albums" },
        { href: "/admin/evenements", libelle: "Événements", icone: "evenements" },
        { href: "/admin/ressources", libelle: "Ressources et documents", icone: "ressources" },
        { href: "/admin/referentiels", libelle: "Référentiels", icone: "referentiels" },
      ],
    },
    {
      titre: "Communauté",
      couleur: "or",
      liens: [
        { href: "/admin/comptes", libelle: "Comptes", icone: "comptes" },
        { href: "/admin/membres", libelle: "Bureau et membres", icone: "membres" },
        { href: "/admin/poles", libelle: "Pôles", icone: "poles" },
        { href: "/admin/moderation", libelle: "Modération", icone: "moderation" },
        { href: "/admin/messages", libelle: "Messages", icone: "messages" },
      ],
    },
    {
      titre: "Système",
      couleur: "encre",
      liens: [
        { href: "/admin/parametres", libelle: "Paramètres", icone: "parametres" },
        { href: "/admin/journal", libelle: "Journal", icone: "journal" },
      ],
    },
  ],
};

/**
 * Navigation du compte éditeur : uniquement les liens des droits qu'il détient,
 * dans les catégories (et couleurs) de la navigation d'administration.
 */
function espaceEditeur(droits: readonly string[]): ConfigEspace {
  const cheminsAutorises = new Set(
    DROITS_EDITEUR.filter((d) => droits.includes(d.cle)).map((d) => d.chemin),
  );
  return {
    ...ESPACE_ADMIN,
    nom: "Édition",
    libelleNavigation: "Sections d'édition",
    groupes: ESPACE_ADMIN.groupes
      .map((g) => ({ ...g, liens: g.liens.filter((l) => cheminsAutorises.has(l.href)) }))
      .filter((g) => g.liens.length > 0),
  };
}

/** Écran de l'éditeur d'une page : pleine hauteur, sans cadre d'administration. */
const ECRAN_EDITEUR = /^\/admin\/editeur\/[^/]+/;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await sessionCourante();

  if (!session) {
    redirect("/connexion?suite=/admin");
  }

  /*
   * Compte administrateur sans double authentification : on l'oriente vers
   * son activation plutôt que de laisser l'API répondre 403 et l'interface
   * afficher une erreur incompréhensible.
   */
  if (
    session.role === "admin" &&
    session.doubleAuthentificationExigee &&
    !session.doubleAuthentification
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-[52ch]">
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
            Double authentification requise
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-ink">
            L'administration l'exige. Votre compte peut valider des inscriptions, modérer et
            supprimer des contenus : s'il est compromis, c'est l'association entière qui l'est.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/securite"
              className="inline-block rounded-md bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Activer maintenant
            </Link>
            <BoutonDeconnexion />
          </div>
        </div>
      </div>
    );
  }

  /*
   * Le chemin vient de src/proxy.ts. Absent, il vaut "" : un éditeur est alors
   * traité comme hors de son périmètre (refus), jamais l'inverse.
   */
  const chemin = (await headers()).get("x-pathname") ?? "";
  const estEditeur = session.role === "editeur";
  const droitsEditeur = DROITS_EDITEUR.filter((d) => session.droits.includes(d.cle));
  // Périmètre de l'éditeur : les routes liées à ses droits, rien d'autre.
  const dansPerimetreEditeur = droitsEditeur.some((d) => cheminDuDroit(chemin, d));
  const droitManquant = droitRequis(chemin);
  const peutEditeurVisuel = session.droits.includes("editeur_visuel");

  // Écran de l'éditeur visuel : pleine page, pour l'administrateur et l'éditeur qui en a le droit.
  if (
    (session.role === "admin" || (estEditeur && peutEditeurVisuel)) &&
    ECRAN_EDITEUR.test(chemin)
  ) {
    return <>{children}</>;
  }

  /*
   * Deuxième barrière, côté interface. L'API refuse déjà toute route
   * d'administration à un non-administrateur : ce contrôle évite surtout
   * d'afficher une coquille vide et incompréhensible. Le rôle éditeur passe
   * (cadre restreint ci-dessous), les autres rôles sont refusés.
   */
  if (session.role !== "admin" && !estEditeur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-medium text-ink">Accès réservé</h1>
          <p className="mt-3 text-[15px] text-muted-ink">
            Votre compte n'a pas les droits d'administration. Votre espace est celui de la Cellule
            Scientifique.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cellule"
              className="inline-block rounded-md bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Aller à la Cellule Scientifique
            </Link>
            <BoutonDeconnexion />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShellEspace
      espace={estEditeur ? espaceEditeur(session.droits) : ESPACE_ADMIN}
      utilisateur={{
        nom: session.nom,
        email: session.email,
        roleLibelle: estEditeur ? "Éditeur" : "Administrateur",
      }}
    >
      {estEditeur && !dansPerimetreEditeur ? (
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-medium text-ink">Accès réservé</h1>
          <p className="mt-3 text-[15px] text-muted-ink">
            {droitManquant
              ? `Cette page demande le droit « ${droitManquant.libelle} », que votre compte n'a pas.`
              : "Cette page est réservée aux administrateurs."}{" "}
            {droitsEditeur.length > 0
              ? `Vos droits : ${droitsEditeur.map((d) => d.libelle).join(", ")}.`
              : "Aucun droit d'édition ne vous a encore été attribué : contactez un administrateur."}
          </p>
          {droitsEditeur[0] ? (
            <Link
              href={droitsEditeur[0].chemin}
              className="mt-6 inline-block rounded-md bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-primary-foreground"
            >
              Aller à « {droitsEditeur[0].libelle} »
            </Link>
          ) : null}
        </div>
      ) : (
        children
      )}
    </ShellEspace>
  );
}
