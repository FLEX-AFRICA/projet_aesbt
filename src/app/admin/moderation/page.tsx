import { BookOpen, Flag, MessageSquareQuote, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { appelApi } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { publierContenu, rejeterRessource, traiterSignalement, validerRessource } from "../actions";
import { BoutonAction } from "../_composants/BoutonAction";
import { BoutonMotif } from "../_composants/BoutonMotif";
import { Pastille } from "../_gestion/Pastille";
import { MOTIFS_REJET_RESSOURCE } from "../_gestion/motifs";
import { EnTetePageAdmin } from "../_kit";

export const metadata = { title: "Modération" };

interface Temoignage {
  id: string;
  titre: string;
  corps: string | null;
  created_at: string;
  auteur_nom: string | null;
  universite_nom: string | null;
}

interface RessourceProposee {
  id: string;
  titre: string;
  description: string;
  url: string | null;
  created_at: string;
  filiere_nom: string | null;
  propose_par_nom: string | null;
}

interface Signalement {
  id: string;
  cible_type: string;
  cible_id: string;
  motif: string;
  description: string | null;
  created_at: string;
  auteur_nom: string | null;
}

function Vide({ texte }: { texte: string }) {
  return (
    <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface/40 p-6 text-center text-[14px] text-muted-ink">
      <ShieldCheck aria-hidden="true" className="size-4 text-accent-green" />
      {texte}
    </p>
  );
}

/** En-tête de section : icône, titre, effectif (mis en avant s'il y a à traiter). */
function EnTeteSection({
  icone: Icone,
  titre,
  total,
  children,
}: {
  icone: LucideIcon;
  titre: string;
  total: number;
  children?: ReactNode;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2.5 font-display text-lg tracking-tight text-ink">
        <Icone aria-hidden="true" className="size-5 text-muted-ink" />
        {titre}
        <Pastille ton={total > 0 ? "ambre" : "gris"}>{total}</Pastille>
      </h2>
      {children ? <p className="mt-1 text-[13px] text-muted-ink">{children}</p> : null}
    </div>
  );
}

export default async function ModerationPage() {
  const [temoignages, ressources, signalements] = await Promise.all([
    appelApi<{ temoignages: Temoignage[] }>("/api/v1/admin/temoignages/en-attente"),
    appelApi<{ ressources: RessourceProposee[] }>("/api/v1/admin/ressources?statut=propose"),
    appelApi<{ signalements: Signalement[] }>("/api/v1/admin/signalements?statut=nouveau"),
  ]);

  return (
    <div className="space-y-12">
      <EnTetePageAdmin
        titre="Modération"
        description="Rien n'est publié sans décision du bureau. Un refus est toujours motivé et notifié."
      />

      {/* Signalements en premier : ce sont les plus urgents. */}
      <section>
        <EnTeteSection icone={Flag} titre="Signalements" total={signalements.signalements.length} />
        <div className="mt-4 space-y-3">
          {signalements.signalements.length === 0 ? (
            <Vide texte="Aucun signalement en attente." />
          ) : (
            signalements.signalements.map((s) => (
              <article key={s.id} className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                <p className="text-[12px] uppercase tracking-[0.12em] text-muted-ink">
                  {s.cible_type}, signalé par {s.auteur_nom ?? "inconnu"} le{" "}
                  {formatDate(s.created_at.slice(0, 10))}
                </p>
                <p className="mt-2 font-display text-[16px] text-ink">{s.motif}</p>
                {s.description ? (
                  <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-ink-soft">
                    {s.description}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <BoutonAction action={traiterSignalement.bind(null, s.id, "en_cours")}>
                    Prendre en charge
                  </BoutonAction>
                  <BoutonAction
                    variante="principal"
                    action={traiterSignalement.bind(null, s.id, "traite")}
                  >
                    Marquer traité
                  </BoutonAction>
                  <BoutonAction action={traiterSignalement.bind(null, s.id, "rejete")}>
                    Rejeter
                  </BoutonAction>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section>
        <EnTeteSection
          icone={BookOpen}
          titre="Ressources proposées"
          total={ressources.ressources.length}
        />
        <div className="mt-4 space-y-3">
          {ressources.ressources.length === 0 ? (
            <Vide texte="Aucune proposition en attente." />
          ) : (
            ressources.ressources.map((r) => (
              <article key={r.id} className="rounded-xl border border-line bg-surface/50 p-5">
                <p className="text-[12px] uppercase tracking-[0.12em] text-muted-ink">
                  Proposée par {r.propose_par_nom ?? "inconnu"} le{" "}
                  {formatDate(r.created_at.slice(0, 10))}
                  {r.filiere_nom ? `, ${r.filiere_nom}` : null}
                </p>
                <h3 className="mt-2 font-display text-[17px] text-ink">{r.titre}</h3>
                <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-muted-ink">
                  {r.description}
                </p>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="mt-2 inline-block break-all text-[13px] font-semibold text-accent-blue hover:underline"
                  >
                    {r.url}
                  </a>
                ) : null}
                <div className="mt-4 flex flex-wrap items-start gap-2">
                  <BoutonAction variante="principal" action={validerRessource.bind(null, r.id)}>
                    Publier
                  </BoutonAction>
                  <BoutonMotif
                    libelle="Rejeter"
                    titre="Rejeter cette proposition"
                    aide="Le motif sera envoyé à la personne qui l'a proposée."
                    motifsFrequents={MOTIFS_REJET_RESSOURCE}
                    action={rejeterRessource.bind(null, r.id)}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section>
        <EnTeteSection
          icone={MessageSquareQuote}
          titre="Témoignages"
          total={temoignages.temoignages.length}
        >
          Un témoignage publié engage l'image de l'association et celle de l'université citée.
        </EnTeteSection>
        <div className="mt-4 space-y-3">
          {temoignages.temoignages.length === 0 ? (
            <Vide texte="Aucun témoignage en attente." />
          ) : (
            temoignages.temoignages.map((t) => (
              <article key={t.id} className="rounded-xl border border-line bg-surface/50 p-5">
                <p className="text-[12px] uppercase tracking-[0.12em] text-muted-ink">
                  {t.auteur_nom ?? "Auteur inconnu"}
                  {t.universite_nom ? `, ${t.universite_nom}` : null},{" "}
                  {formatDate(t.created_at.slice(0, 10))}
                </p>
                <h3 className="mt-2 font-display text-[17px] text-ink">{t.titre}</h3>
                {t.corps ? (
                  <p className="mt-2 max-w-[70ch] whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
                    {t.corps}
                  </p>
                ) : null}
                <div className="mt-4">
                  <BoutonAction variante="principal" action={publierContenu.bind(null, t.id)}>
                    Publier
                  </BoutonAction>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
