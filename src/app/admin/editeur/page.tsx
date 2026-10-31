import { CircleCheck, Clock, FilePen, FileText, PenLine, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DROITS_EDITEUR } from "@/components/droits/catalogue";
import { sessionCourante } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { Indicateur } from "../_gestion/Indicateur";
import { classeBoutonPrincipal, EnTetePageAdmin } from "../_kit";
import { PAGES_EDITABLES } from "./_lib/pages";
import { chargerResume } from "./_lib/serveur";

export const metadata: Metadata = { title: "Éditeur visuel" };

/** Accueil de l'éditeur visuel : les pages éditables et leurs brouillons. */
export default async function EditeurAccueilPage() {
  // Un seul appel pour toutes les pages : brouillons et soumissions en attente.
  const [resume, session] = await Promise.all([chargerResume(), sessionCourante()]);
  const estEditeur = session?.role === "editeur";
  const mesDroits = DROITS_EDITEUR.filter((d) => session?.droits.includes(d.cle));
  const autresDroits = mesDroits.filter((d) => d.cle !== "editeur_visuel");
  const lignes = PAGES_EDITABLES.map((page) => {
    const ligne = resume?.find((r) => r.page === page.slug);
    return {
      page,
      brouillons: resume === null ? null : (ligne?.clesBrouillon ?? 0),
      soumission: ligne?.soumission ?? null,
    };
  });

  const totalBrouillons = lignes.reduce((n, l) => n + (l.brouillons ?? 0), 0);
  const totalAttente = lignes.filter((l) => l.soumission).length;
  const synthese = [
    { icone: FileText, valeur: lignes.length, libelle: "pages éditables" },
    { icone: FilePen, valeur: totalBrouillons, libelle: "champs en brouillon" },
    { icone: Clock, valeur: totalAttente, libelle: "en attente de validation" },
  ];

  return (
    <div className="grid gap-8">
      <EnTetePageAdmin
        titre="Éditeur visuel"
        description="Modifiez les textes et les images des pages du site en voyant le résultat. Les modifications restent en brouillon tant qu'elles ne sont pas publiées."
      />

      {estEditeur ? (
        <section
          aria-labelledby="mes-droits"
          className="rounded-xl border border-line bg-surface/40 p-4"
        >
          <h2 id="mes-droits" className="flex items-center gap-2 font-display text-[15px] text-ink">
            <ShieldCheck aria-hidden="true" className="size-4 text-muted-ink" />
            Vos droits d'éditeur
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Vous pouvez préparer et soumettre des modifications des pages du site, mais pas les
            publier : le bureau les relit et les valide.
          </p>
          {autresDroits.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {autresDroits.map((d) => (
                <li key={d.cle}>
                  <Link
                    href={d.chemin}
                    className="inline-block rounded-full px-3 py-1 text-[12.5px] font-semibold text-accent-blue ring-1 ring-inset ring-accent-blue/30 hover:bg-accent-blue/10"
                  >
                    {d.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-muted-ink">
              Votre seul droit est l'éditeur visuel.
            </p>
          )}
        </section>
      ) : null}

      <ol className="grid gap-3 text-[14px] text-ink-soft sm:grid-cols-3">
        {[
          "Choisissez une page dans la liste.",
          "Modifiez les textes et les images en voyant le résultat.",
          "Soumettez vos modifications : le bureau les relit et les publie.",
        ].map((etape, i) => (
          <li key={etape} className="flex gap-3 rounded-xl border border-line bg-surface/40 p-4">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-blue text-[12px] font-semibold text-primary-foreground">
              {i + 1}
            </span>
            {etape}
          </li>
        ))}
      </ol>

      <dl className="grid gap-3 sm:grid-cols-3">
        {synthese.map(({ icone: Icone, valeur, libelle }) => (
          <div
            key={libelle}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface/50 p-4"
          >
            <Icone aria-hidden="true" className="size-5 text-muted-ink" />
            <div>
              <dd className="font-display text-xl text-ink">{valeur}</dd>
              <dt className="text-[12px] text-muted-ink">{libelle}</dt>
            </div>
          </div>
        ))}
      </dl>

      <div className="rounded-2xl border border-line bg-frost-deep/30 p-1">
        <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[620px] text-left text-[14px]">
            <caption className="sr-only">Pages éditables</caption>
            <thead className="bg-frost-deep/30 text-[12px] uppercase tracking-[0.08em] text-muted-ink">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Page
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Brouillons
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Validation
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {lignes.map(({ page, brouillons, soumission }) => (
                <tr key={page.slug} className="transition-colors hover:bg-frost-deep/25">
                  <th scope="row" className="px-5 py-4 font-semibold text-ink">
                    {page.titre}
                    <span className="block text-[12px] font-normal text-muted-ink">
                      {page.description}
                    </span>
                  </th>
                  <td className="px-5 py-4 text-ink-soft">
                    {brouillons === null
                      ? "Inconnu"
                      : brouillons === 0
                        ? "Aucun"
                        : `${brouillons} champ${brouillons > 1 ? "s" : ""} en brouillon`}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {soumission ? (
                      <span>
                        <Indicateur icone={Clock} ton="ambre">
                          En attente de validation
                        </Indicateur>
                        <span className="mt-1 block text-[12px] text-muted-ink">
                          Par {soumission.soumisParNom ?? "un éditeur"}, le{" "}
                          {formatDate(soumission.soumisLe)}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-ink">
                        <CircleCheck aria-hidden="true" className="size-4" />
                        Aucune soumission
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/editeur/${page.slug}`}
                      className={`${classeBoutonPrincipal} gap-1.5`}
                    >
                      <PenLine aria-hidden="true" className="size-3.5" />
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
