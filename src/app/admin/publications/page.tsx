import Link from "next/link";

import { appelApi } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { archiverContenu, publierContenu } from "../actions";
import { BoutonAction } from "../_composants/BoutonAction";

export const metadata = { title: "Publications" };

interface Publication {
  id: string;
  type: string;
  slug: string;
  titre: string;
  chapeau: string | null;
  statut: string;
  planifie_le: string | null;
  publie_le: string | null;
  auteur_nom: string | null;
  created_at: string;
}

/** Les six types du cahier des charges, servis par un seul moteur. */
const TYPES = [
  { valeur: "actualite", libelle: "Actualités" },
  { valeur: "annonce", libelle: "Annonces" },
  { valeur: "excellence", libelle: "Excellence" },
  { valeur: "actualite_scientifique", libelle: "Actualités scientifiques" },
  { valeur: "temoignage", libelle: "Témoignages" },
  { valeur: "page", libelle: "Pages" },
];

const COULEURS: Record<string, string> = {
  brouillon: "bg-zinc-200 text-zinc-800",
  publie: "bg-emerald-100 text-emerald-900",
  archive: "bg-amber-100 text-amber-900",
};

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const filtre = TYPES.some((t) => t.valeur === type) ? type : "actualite";

  const { publications } = await appelApi<{ publications: Publication[] }>(
    `/api/v1/admin/publications?type=${filtre}`,
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
            Publications
          </h1>
          <p className="mt-2 text-[15px] text-muted-ink">
            Un même moteur sert les six types de contenu éditorial du site.
          </p>
        </div>
        <Link
          href="/admin/publications/nouveau"
          className="rounded-full bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Nouveau contenu
        </Link>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filtrer par type">
        {TYPES.map((t) => (
          <Link
            key={t.valeur}
            href={`/admin/publications?type=${t.valeur}`}
            aria-current={filtre === t.valeur ? "page" : undefined}
            className="rounded-full border border-line px-4 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface aria-[current=page]:border-accent-blue aria-[current=page]:bg-accent-blue aria-[current=page]:text-primary-foreground"
          >
            {t.libelle}
          </Link>
        ))}
      </nav>

      {publications.length === 0 ? (
        <p className="mt-10 rounded-xl border border-line bg-surface/50 p-8 text-center text-[15px] text-muted-ink">
          Aucun contenu de ce type.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {publications.map((p) => (
            <li key={p.id} className="rounded-xl border border-line bg-surface/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                        COULEURS[p.statut] ?? "bg-zinc-100"
                      }`}
                    >
                      {p.statut}
                    </span>
                    {p.planifie_le ? (
                      <span className="rounded-full bg-accent-blue/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-blue">
                        programmé le {formatDate(p.planifie_le.slice(0, 10))}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-2 font-display text-[17px] text-ink">{p.titre}</h2>
                  {p.chapeau ? (
                    <p className="mt-1 max-w-[70ch] text-[14px] text-muted-ink">{p.chapeau}</p>
                  ) : null}
                  <p className="mt-1 text-[12px] text-muted-ink">
                    {p.auteur_nom ? `${p.auteur_nom}, ` : null}
                    {p.publie_le
                      ? `publié le ${formatDate(p.publie_le.slice(0, 10))}`
                      : `créé le ${formatDate(p.created_at.slice(0, 10))}`}
                  </p>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <Link
                    href={`/admin/publications/${p.id}`}
                    className="rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface"
                  >
                    Modifier
                  </Link>

                  {p.statut === "publie" ? (
                    <>
                      {filtre === "actualite" ? (
                        <Link
                          href={`/actualites/${p.slug}`}
                          className="rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface"
                        >
                          Voir
                        </Link>
                      ) : null}
                      <BoutonAction
                        variante="danger"
                        confirmation="Archiver ce contenu ? Il disparaîtra du site public."
                        action={archiverContenu.bind(null, p.id)}
                      >
                        Archiver
                      </BoutonAction>
                    </>
                  ) : (
                    <BoutonAction variante="principal" action={publierContenu.bind(null, p.id)}>
                      Publier
                    </BoutonAction>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
