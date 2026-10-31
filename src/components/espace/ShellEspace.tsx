"use client";

import { ArrowLeftRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { BoutonDeconnexion } from "@/components/layout/BoutonDeconnexion";
import { NavLink } from "@/components/layout/NavLink";
import { CloucheNotifications } from "@/components/notifications/CloucheNotifications";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

import { ICONES } from "./icones";
import type { ConfigEspace, CouleurGroupe, UtilisateurEspace } from "./types";

/** Couleur de fond des boutons de l'espace et couleur de leur texte, par teinte. */
const TEINTES_BOUTONS: Record<CouleurGroupe, { fond: string; texte: string }> = {
  rouge: { fond: "var(--accent-red)", texte: "oklch(0.99 0.002 40)" },
  vert: { fond: "var(--accent-green)", texte: "oklch(0.99 0.002 40)" },
  or: { fond: "oklch(0.56 0.13 78)", texte: "oklch(0.99 0.002 40)" },
  encre: { fond: "var(--ink)", texte: "var(--background)" },
};

/** Teinte du groupe qui contient la page courante (le lien le plus précis l'emporte). */
function teinteActive(espace: ConfigEspace, chemin: string): CouleurGroupe {
  let meilleure: { longueur: number; couleur: CouleurGroupe } | null = null;
  for (const groupe of espace.groupes) {
    for (const lien of groupe.liens) {
      const correspond = lien.exact
        ? chemin === lien.href
        : chemin === lien.href || chemin.startsWith(`${lien.href}/`);
      if (correspond && (!meilleure || lien.href.length > meilleure.longueur)) {
        meilleure = { longueur: lien.href.length, couleur: groupe.couleur ?? "rouge" };
      }
    }
  }
  return meilleure?.couleur ?? "rouge";
}

const CLASSE_LIEN =
  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink";

/** Lien actif et couleur des icônes, selon la teinte du groupe. */
const TEINTES: Record<CouleurGroupe, { actif: string; icone: string }> = {
  rouge: {
    actif: "bg-accent-red text-white hover:bg-accent-red hover:text-white",
    icone: "text-accent-red",
  },
  vert: {
    actif: "bg-accent-green text-white hover:bg-accent-green hover:text-white",
    icone: "text-accent-green",
  },
  or: {
    actif: "bg-accent-gold text-ink hover:bg-accent-gold hover:text-ink",
    icone: "text-[oklch(0.62_0.14_80)]",
  },
  encre: {
    actif: "bg-ink text-background hover:bg-ink hover:text-background",
    icone: "text-ink-soft",
  },
};

/** Marque de l'espace : logo, nom de l'association et, dessous, le nom de l'espace. */
function Marque({
  nom,
  href,
  surClic,
  compact,
}: {
  nom: string;
  href: string;
  surClic?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(surClic ? { onClick: surClic } : {})}
      aria-label={`AESBT, ${nom}`}
      className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/40"
    >
      <img
        src="/logo_aesbt.jpg"
        alt=""
        width={40}
        height={40}
        className={`shrink-0 rounded-lg object-contain ${compact ? "size-9" : "size-10"}`}
      />
      <span className="grid leading-none">
        <span className="font-display text-xl font-semibold tracking-tight text-ink">AESBT</span>
        <span className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-accent-red">
          {nom}
        </span>
      </span>
    </Link>
  );
}

/** Contenu de la barre latérale, partagé entre la version fixe et le tiroir mobile. */
function Navigation({
  espace,
  utilisateur,
  surNavigation,
  cloche,
}: {
  espace: ConfigEspace;
  utilisateur: UtilisateurEspace;
  /** Cloche de notifications à placer à côté de la marque (barre latérale fixe). */
  cloche?: ReactNode;
  /** Appelé au clic sur un lien (referme le tiroir mobile). */
  surNavigation?: () => void;
}) {
  const Bascule = espace.bascule ? ICONES[espace.bascule.icone] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
        <Marque
          nom={espace.nom}
          href={espace.logoHref ?? "/"}
          {...(surNavigation ? { surClic: surNavigation } : {})}
        />
        {cloche}
      </div>

      <nav aria-label={espace.libelleNavigation} className="flex-1 overflow-y-auto px-3 py-4">
        {espace.groupes.map((groupe) => {
          const teinte = TEINTES[groupe.couleur ?? "rouge"];
          return (
            <div key={groupe.titre} className="mb-5 last:mb-0">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-ink">
                {groupe.titre}
              </p>
              <ul className="grid gap-0.5">
                {groupe.liens.map((lien) => {
                  const Icone = ICONES[lien.icone];
                  return (
                    <li key={lien.href}>
                      <NavLink
                        href={lien.href}
                        {...(lien.exact ? { exact: true } : {})}
                        {...(surNavigation ? { onClick: surNavigation } : {})}
                        activeClassName={teinte.actif}
                        className={CLASSE_LIEN}
                      >
                        <Icone
                          aria-hidden="true"
                          className={`size-4 shrink-0 ${teinte.icone} group-aria-[current=page]:text-current`}
                        />
                        {lien.libelle}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="grid gap-3 border-t border-line px-4 py-4">
        {espace.bascule && Bascule ? (
          <Link
            href={espace.bascule.href}
            {...(surNavigation ? { onClick: surNavigation } : {})}
            className="flex items-center gap-2 text-[13px] font-semibold text-accent-blue hover:underline"
          >
            <ArrowLeftRight aria-hidden="true" className="size-4 shrink-0" />
            <Bascule aria-hidden="true" className="size-4 shrink-0" />
            {espace.bascule.libelle}
          </Link>
        ) : null}
        <div className="min-w-0">
          {utilisateur.nom ? (
            <p className="truncate text-[13.5px] font-medium text-ink">{utilisateur.nom}</p>
          ) : null}
          <p className="truncate text-[12.5px] text-muted-ink">{utilisateur.email}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-ink">
            {utilisateur.roleLibelle}
          </p>
        </div>
        <BoutonDeconnexion />
      </div>
    </div>
  );
}

/**
 * Cadre commun des espaces connectés (administration, édition, cellule) :
 * barre latérale fixe à partir de `lg`, tiroir rétractable en dessous.
 * La navigation vient d'une configuration déclarative sérialisable.
 */
export function ShellEspace({
  espace,
  utilisateur,
  children,
}: {
  espace: ConfigEspace;
  utilisateur: UtilisateurEspace;
  children: ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const chemin = usePathname();
  const bouton = TEINTES_BOUTONS[teinteActive(espace, chemin)];
  const hrefNotifications =
    espace.notificationsHref ??
    (chemin.startsWith("/admin") ? "/admin/notifications" : "/cellule/notifications");

  /*
   * Tiroirs et boîtes de dialogue sont rendus hors de cet arbre (portail) :
   * la teinte est aussi posée sur la racine pour que leurs boutons la suivent.
   */
  useEffect(() => {
    const racine = document.documentElement;
    racine.style.setProperty("--teinte", bouton.fond);
    racine.style.setProperty("--teinte-fg", bouton.texte);
    return () => {
      racine.style.removeProperty("--teinte");
      racine.style.removeProperty("--teinte-fg");
    };
  }, [bouton.fond, bouton.texte]);

  const styleTeinte = { "--teinte": bouton.fond, "--teinte-fg": bouton.texte } as CSSProperties;

  return (
    <div
      style={styleTeinte}
      className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
    >
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface/60 lg:block">
        <Navigation
          espace={espace}
          utilisateur={utilisateur}
          cloche={<CloucheNotifications hrefToutes={hrefNotifications} />}
        />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOuvert(true)}
            aria-label="Ouvrir le menu"
            className="rounded-md border border-line p-2 text-ink hover:bg-surface"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <Marque nom={espace.nom} href={espace.logoHref ?? "/"} compact />
          <CloucheNotifications hrefToutes={hrefNotifications} align="end" className="ml-auto" />
        </header>

        <Sheet open={ouvert} onOpenChange={setOuvert}>
          <SheetContent side="left" className="w-72 max-w-[85vw] bg-background p-0 sm:max-w-xs">
            <SheetTitle className="sr-only">{espace.libelleNavigation}</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation de l'espace {espace.nom}
            </SheetDescription>
            <Navigation
              espace={espace}
              utilisateur={utilisateur}
              surNavigation={() => setOuvert(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
