import { ScrollText } from "lucide-react";
import Link from "next/link";

import { appelApi } from "@/lib/api-admin";

import { EtatVide } from "../_gestion/EtatVide";
import { OngletsFiltre } from "../_gestion/OngletsFiltre";
import { EnTetePageAdmin } from "../_kit";

import { detailLisible, libelleAction, libelleCible } from "./_lib/libelles";

export const metadata = { title: "Journal d'audit" };

interface EntreeAudit {
  id: number;
  action: string;
  cible_type: string | null;
  cible_id: string | null;
  details: string | null;
  created_at: string;
  acteur_nom: string | null;
}

/** Familles d'actions (préfixe avant le point) proposées en filtre. */
const FAMILLES: Record<string, string> = {
  compte: "Comptes",
  mentorat: "Mentorat",
  signalement: "Signalements",
  ressource: "Ressources",
  publication: "Contenus",
  temoignage: "Témoignages",
  contenu: "Pages",
  album: "Albums",
  evenement: "Événements",
  membre: "Membres",
  document: "Documents",
  media: "Médias",
  statistique: "Statistiques",
  parametres: "Paramètres",
};

const famille = (action: string) => action.split(".")[0] ?? action;

function horodatage(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const { page: pageBrute, type } = await searchParams;
  const page = Math.max(1, Number(pageBrute) || 1);

  const { entrees } = await appelApi<{ entrees: EntreeAudit[] }>(
    `/api/v1/admin/audit?page=${page}&taille=100`,
  );

  // Le filtre porte sur les entrées de la page chargée : seules les familles présentes sont proposées.
  const presentes = [...new Set(entrees.map((e) => famille(e.action)))].sort((a, b) =>
    (FAMILLES[a] ?? a).localeCompare(FAMILLES[b] ?? b, "fr"),
  );
  const filtre = type && presentes.includes(type) ? type : undefined;
  const visibles = filtre ? entrees.filter((e) => famille(e.action) === filtre) : entrees;
  const compteFamille = (f: string) => entrees.filter((e) => famille(e.action) === f).length;
  const suffixeType = filtre ? `&type=${filtre}` : "";

  return (
    <div className="grid gap-6">
      <EnTetePageAdmin
        titre="Journal d'audit"
        description="Toute action d'administration est consignée. Ce n'est pas de la surveillance : le bureau change chaque année, et sans cette trace la reprise serait impossible. En cas de contestation, elle permet de retrouver ce qui s'est réellement passé."
      />

      {entrees.length > 0 ? (
        <OngletsFiltre
          libelle="Filtrer par type d'action"
          onglets={[
            { libelle: "Toutes", href: "/admin/journal", actif: !filtre, compte: entrees.length },
            ...presentes.map((f) => ({
              libelle: FAMILLES[f] ?? f,
              href: `/admin/journal?type=${f}`,
              actif: filtre === f,
              compte: compteFamille(f),
            })),
          ]}
        />
      ) : null}

      {entrees.length === 0 ? (
        <EtatVide icone={ScrollText} titre="Aucune action enregistrée">
          Les actions d'administration apparaîtront ici dès qu'elles auront lieu.
        </EtatVide>
      ) : (
        <>
          <div className="rounded-2xl border border-line bg-frost-deep/30 p-1">
            <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
              <table className="w-full min-w-[640px] text-left text-[14px]">
                <caption className="sr-only">
                  Actions d'administration, de la plus récente à la plus ancienne
                </caption>
                <thead>
                  <tr className="border-b border-line bg-frost-deep/30 text-[12px] uppercase tracking-[0.08em] text-muted-ink">
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Quand
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Qui
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Action
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Détail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {visibles.map((entree) => {
                    const detail = detailLisible(entree.details);
                    const cible = libelleCible(entree.cible_type, entree.cible_id);

                    return (
                      <tr key={entree.id} className="transition-colors hover:bg-frost-deep/25">
                        <td className="whitespace-nowrap px-5 py-4 text-[13px] text-muted-ink">
                          {horodatage(entree.created_at)}
                        </td>
                        <td className="px-5 py-4 font-medium text-ink">
                          {entree.acteur_nom ?? "Inconnu"}
                        </td>
                        <td className="px-5 py-4 text-ink-soft">
                          <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-ink">
                            {FAMILLES[famille(entree.action)] ?? famille(entree.action)}
                          </span>
                          <span className="block">{libelleAction(entree.action)}</span>
                          {cible ? (
                            <span className="block text-[12px] text-muted-ink">{cible}</span>
                          ) : null}
                        </td>
                        <td
                          className="max-w-[32ch] truncate px-5 py-4 text-[13px] text-muted-ink"
                          title={detail ?? undefined}
                        >
                          {detail ?? ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <nav className="flex items-center gap-3" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={`/admin/journal?page=${page - 1}${suffixeType}`}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-xs transition-colors hover:bg-frost-deep/40"
              >
                Précédent
              </Link>
            ) : null}
            <span className="text-[13px] text-muted-ink">Page {page}</span>
            {entrees.length === 100 ? (
              <Link
                href={`/admin/journal?page=${page + 1}${suffixeType}`}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-xs transition-colors hover:bg-frost-deep/40"
              >
                Suivant
              </Link>
            ) : null}
          </nav>
        </>
      )}
    </div>
  );
}
