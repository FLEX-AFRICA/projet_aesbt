import { CalendarPlus, FilePlus2, FolderPlus, ImagePlus, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

interface Raccourci {
  libelle: string;
  href: string;
  icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const CATEGORIES: { titre: string; raccourcis: Raccourci[] }[] = [
  {
    titre: "Contenus",
    raccourcis: [
      { libelle: "Créer une publication", href: "/admin/publications/nouveau", icone: FilePlus2 },
      { libelle: "Créer un événement", href: "/admin/evenements", icone: CalendarPlus },
      {
        libelle: "Ajouter une ressource ou un document",
        href: "/admin/ressources",
        icone: FolderPlus,
      },
    ],
  },
  {
    titre: "Galerie",
    raccourcis: [
      { libelle: "Créer un album", href: "/admin/galerie", icone: ImagePlus },
      { libelle: "Téléverser une image", href: "/admin/galerie?vue=images", icone: ImagePlus },
    ],
  },
  {
    titre: "Communauté",
    raccourcis: [
      { libelle: "Ajouter un membre", href: "/admin/membres", icone: UserPlus },
      { libelle: "Paramètres du site", href: "/admin/parametres", icone: Settings },
    ],
  },
];

/** Raccourcis de création, regroupés par catégorie. */
export function RaccourcisRapides() {
  return (
    <section aria-labelledby="titre-raccourcis">
      <h2 id="titre-raccourcis" className="font-display text-lg tracking-tight text-ink">
        Raccourcis
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {CATEGORIES.map((categorie) => (
          <div key={categorie.titre} className="rounded-2xl border border-line bg-surface/60 p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-ink">
              {categorie.titre}
            </h3>
            <ul className="mt-3 grid gap-1">
              {categorie.raccourcis.map(({ libelle, href, icone: Icone }) => (
                <li key={libelle}>
                  <Link
                    href={href}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[14px] text-ink-soft transition-colors hover:bg-frost-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40"
                  >
                    <Icone aria-hidden className="size-4 shrink-0 text-accent-blue" />
                    {libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
