import { Info, Library, Send, Share2 } from "lucide-react";
import Link from "next/link";

import { appelApi } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { chargerSuggestionsMembre } from "../_suggestions";
import { Badge, EnTetePage, EtatVide, type TonBadge } from "../_ui";
import { Proposer } from "./Proposer";
import { RetirerProposition } from "./RetirerProposition";

export const metadata = { title: "Mes ressources" };

interface Proposition {
  id: string;
  titre: string;
  description: string;
  url: string | null;
  statut: string;
  rejet_motif: string | null;
  created_at: string;
}

const ETIQUETTES: Record<string, { texte: string; ton: TonBadge }> = {
  propose: { texte: "En attente de validation", ton: "attente" },
  publie: { texte: "Publiée dans la communauté", ton: "succes" },
  rejete: { texte: "Rejetée", ton: "danger" },
  brouillon: { texte: "Brouillon", ton: "neutre" },
  archive: { texte: "Archivée", ton: "neutre" },
};

export default async function RessourcesCellulePage() {
  const [{ filieres }, { niveaux }, mesPropositions, suggestions] = await Promise.all([
    appelApi<{ filieres: { id: string; nom: string; slug: string }[] }>("/api/v1/filieres"),
    appelApi<{ niveaux: { id: string; libelle: string }[] }>("/api/v1/niveaux"),
    appelApi<{ ressources: Proposition[] }>("/api/v1/ressources/mes-propositions").catch(() => ({
      ressources: [] as Proposition[],
    })),
    chargerSuggestionsMembre(["categorie"]),
  ]);

  return (
    <div className="space-y-8">
      <EnTetePage
        icone={Library}
        titre="Mes ressources"
        texte="Proposez un lien ou un document utile aux autres étudiants et suivez le sort de vos propositions."
        actions={
          <Proposer filieres={filieres} niveaux={niveaux} categories={suggestions.categorie} />
        }
      />

      <p className="flex items-start gap-2 rounded-xl border border-line bg-frost px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-blue" />
        <span>
          Chaque proposition est vérifiée par l'équipe. Si elle est acceptée, elle apparaît dans la
          rubrique Communauté, réservée aux membres connectés, sous{" "}
          <Link
            href="/cellule/communaute/ressources"
            className="font-semibold text-accent-blue hover:underline"
          >
            Ressources partagées
          </Link>
          . Elle n'est jamais publiée sur le site public.
        </span>
      </p>

      <section aria-labelledby="mes-propositions">
        <h2
          id="mes-propositions"
          className="flex items-center gap-2 font-display text-lg tracking-tight text-ink"
        >
          <Send aria-hidden="true" className="size-[18px] text-accent-blue" />
          Mes propositions ({mesPropositions.ressources.length})
        </h2>
        {mesPropositions.ressources.length === 0 ? (
          <EtatVide
            className="mt-4"
            icone={Send}
            titre="Vous n'avez rien proposé pour le moment"
            texte="Partagez une référence utile : l'équipe la vérifie, puis la rend visible aux membres dans la rubrique Communauté."
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {mesPropositions.ressources.map((p) => {
              const e = ETIQUETTES[p.statut] ?? { texte: p.statut, ton: "neutre" as const };
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge ton={e.ton}>{e.texte}</Badge>
                        <span className="text-[12px] text-muted-ink">
                          {formatDate(p.created_at.slice(0, 10))}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-[16px] text-ink">{p.titre}</h3>
                      {p.statut === "publie" ? (
                        <Link
                          href="/cellule/communaute/ressources"
                          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-blue hover:underline"
                        >
                          <Share2 aria-hidden="true" className="size-3.5" />
                          Voir dans les ressources partagées
                        </Link>
                      ) : null}
                      {p.rejet_motif ? (
                        <p className="mt-2 max-w-[65ch] rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-900">
                          Motif du rejet : {p.rejet_motif}
                        </p>
                      ) : null}
                    </div>
                    {p.statut === "propose" ? <RetirerProposition id={p.id} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
