import { History, HeartHandshake, Inbox, Mail, MessageCircle, Phone, Send } from "lucide-react";
import Link from "next/link";

import { appelApi, sessionCourante } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { Badge, classeCarte, EnTetePage, EtatVide, type TonBadge } from "../_ui";
import { AnnulerDemande } from "./AnnulerDemande";
import { CloreRelation, ReponseDemande, Signaler } from "./Reponse";

export const metadata = { title: "Mon mentorat" };

interface Demande {
  id: string;
  statut: string;
  message: string | null;
  reponse_message: string | null;
  expire_le: string;
  repondu_le: string | null;
  created_at: string;
  interlocuteur_nom: string | null;
  interlocuteur_filiere: string | null;
}

interface Relation {
  id: string;
  statut: string;
  mon_role: string;
  demarree_le: string;
  terminee_le: string | null;
  motif_fin: string | null;
  etudiant_id: string;
  mentor_id: string;
  interlocuteur:
    | {
        nom?: string;
        email?: string;
        telephone?: string | null;
        whatsapp?: string | null;
        filiere_nom?: string | null;
        niveau_id?: string | null;
      }
    | undefined;
}

const ETIQUETTES: Record<string, { texte: string; ton: TonBadge }> = {
  en_attente: { texte: "En attente", ton: "attente" },
  acceptee: { texte: "Acceptée", ton: "succes" },
  refusee: { texte: "Déclinée", ton: "neutre" },
  expiree: { texte: "Expirée", ton: "neutre" },
  annulee: { texte: "Annulée", ton: "neutre" },
};

function BadgeDemande({ statut }: { statut: string }) {
  const e = ETIQUETTES[statut] ?? { texte: statut, ton: "neutre" as const };
  return <Badge ton={e.ton}>{e.texte}</Badge>;
}

/** Titre de section avec icône de repérage. */
function TitreSection({
  icone: Icone,
  children,
}: {
  icone: typeof Inbox;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 font-display text-lg tracking-tight text-ink">
      <Icone aria-hidden="true" className="size-[18px] text-accent-blue" />
      {children}
    </h2>
  );
}

export default async function MentoratPage() {
  const session = await sessionCourante();
  const estMentor = session?.role === "mentor" || session?.role === "admin";

  const [envoyees, recues, { relations }] = await Promise.all([
    appelApi<{ demandes: Demande[] }>("/api/v1/mentorat/demandes?role=etudiant"),
    estMentor
      ? appelApi<{ demandes: Demande[] }>("/api/v1/mentorat/demandes?role=mentor")
      : Promise.resolve({ demandes: [] as Demande[] }),
    appelApi<{ relations: Relation[] }>("/api/v1/mentorat/relations"),
  ]);

  const enAttenteRecues = recues.demandes.filter((d) => d.statut === "en_attente");
  const actives = relations.filter((r) => r.statut === "active");
  const closes = relations.filter((r) => r.statut !== "active");

  return (
    <div className="space-y-10">
      <EnTetePage
        icone={HeartHandshake}
        titre="Mon mentorat"
        texte="Les coordonnées d'un interlocuteur ne sont visibles que pendant un accompagnement actif. Elles disparaissent dès qu'il prend fin."
      />

      {estMentor && enAttenteRecues.length > 0 ? (
        <section>
          <TitreSection icone={Inbox}>Demandes reçues ({enAttenteRecues.length})</TitreSection>
          <ul className="mt-4 space-y-4">
            {enAttenteRecues.map((demande) => (
              <li
                key={demande.id}
                className="rounded-2xl border border-accent-blue/40 bg-accent-blue/[0.04] p-5 sm:p-6"
              >
                <p className="text-[12px] uppercase tracking-[0.12em] text-muted-ink">
                  {demande.interlocuteur_nom ?? "Étudiant"}
                  {demande.interlocuteur_filiere ? `, ${demande.interlocuteur_filiere}` : null},
                  reçue le {formatDate(demande.created_at.slice(0, 10))}
                </p>

                {demande.message ? (
                  <blockquote className="mt-3 max-w-[75ch] whitespace-pre-line border-l-2 border-line pl-4 text-[14px] leading-relaxed text-ink-soft">
                    {demande.message}
                  </blockquote>
                ) : null}

                <p className="mt-3 text-[12px] text-muted-ink">
                  Sans réponse, cette demande expirera le{" "}
                  {formatDate(demande.expire_le.slice(0, 10))}.
                </p>

                <div className="mt-4">
                  <ReponseDemande id={demande.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <TitreSection icone={HeartHandshake}>
          Accompagnements en cours ({actives.length})
        </TitreSection>

        {actives.length === 0 ? (
          <EtatVide
            className="mt-4"
            icone={HeartHandshake}
            titre="Aucun accompagnement en cours"
            texte="Dès qu'un mentor accepte votre demande, vos échanges et ses coordonnées apparaissent ici."
            action={
              <Link
                href="/cellule/mentors"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
              >
                Trouver un mentor
              </Link>
            }
          />
        ) : (
          <ul className="mt-4 space-y-4">
            {actives.map((relation) => {
              const autre = relation.interlocuteur ?? {};
              const autreId =
                relation.mon_role === "mentor" ? relation.etudiant_id : relation.mentor_id;

              return (
                <li key={relation.id} className={classeCarte}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.12em] text-muted-ink">
                        {relation.mon_role === "mentor" ? "Vous accompagnez" : "Votre mentor"}
                      </p>
                      <h3 className="mt-1 font-display text-[18px] text-ink">
                        {autre.nom ?? "Nom non communiqué"}
                      </h3>
                      <p className="mt-1 text-[13px] text-muted-ink">
                        {[autre.filiere_nom, autre.niveau_id].filter(Boolean).join(", ")}
                        {autre.filiere_nom ? ", " : ""}
                        depuis le {formatDate(relation.demarree_le.slice(0, 10))}
                      </p>
                    </div>
                  </div>

                  {/* Le cœur du dispositif : les coordonnées, ici et nulle part ailleurs. */}
                  <div className="mt-4 rounded-xl border border-line bg-frost p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-ink">
                      Pour le joindre
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-ink">
                          <Mail aria-hidden="true" className="size-3.5" />
                          E-mail
                        </dt>
                        <dd className="mt-0.5 text-[14px]">
                          {autre.email ? (
                            <a
                              href={`mailto:${autre.email}`}
                              className="break-all text-accent-blue hover:underline"
                            >
                              {autre.email}
                            </a>
                          ) : (
                            <span className="text-muted-ink">non communiqué</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-ink">
                          <Phone aria-hidden="true" className="size-3.5" />
                          Téléphone
                        </dt>
                        <dd className="mt-0.5 text-[14px]">
                          {autre.telephone ? (
                            <a
                              href={`tel:${autre.telephone.replace(/\s/g, "")}`}
                              className="text-accent-blue hover:underline"
                            >
                              {autre.telephone}
                            </a>
                          ) : (
                            <span className="text-muted-ink">non communiqué</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-ink">
                          <MessageCircle aria-hidden="true" className="size-3.5" />
                          WhatsApp
                        </dt>
                        <dd className="mt-0.5 text-[14px]">
                          {autre.whatsapp ? (
                            <a
                              href={`https://wa.me/${autre.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent-blue hover:underline"
                            >
                              {autre.whatsapp}
                            </a>
                          ) : (
                            <span className="text-muted-ink">non communiqué</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <CloreRelation id={relation.id} />
                    <Signaler cibleId={autreId} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <TitreSection icone={Send}>Mes demandes envoyées</TitreSection>

        {envoyees.demandes.length === 0 ? (
          <EtatVide
            className="mt-4"
            icone={Send}
            titre="Aucune demande envoyée"
            texte="Choisissez un mentor de votre filière et présentez-vous en quelques phrases."
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {envoyees.demandes.map((demande) => (
              <li
                key={demande.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgeDemande statut={demande.statut} />
                      <span className="text-[14px] font-medium text-ink">
                        {demande.interlocuteur_nom ?? "Mentor"}
                      </span>
                      {demande.interlocuteur_filiere ? (
                        <span className="text-[12px] text-muted-ink">
                          {demande.interlocuteur_filiere}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-[12px] text-muted-ink">
                      Envoyée le {formatDate(demande.created_at.slice(0, 10))}
                      {demande.statut === "en_attente"
                        ? `, expire le ${formatDate(demande.expire_le.slice(0, 10))}`
                        : null}
                    </p>

                    {demande.reponse_message ? (
                      <blockquote className="mt-3 max-w-[70ch] border-l-2 border-line pl-4 text-[13px] leading-relaxed text-ink-soft">
                        {demande.reponse_message}
                      </blockquote>
                    ) : null}
                  </div>

                  {demande.statut === "en_attente" ? <AnnulerDemande id={demande.id} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {closes.length > 0 ? (
        <section>
          <TitreSection icone={History}>Accompagnements passés</TitreSection>
          <ul className="mt-4 space-y-3">
            {closes.map((relation) => (
              <li
                key={relation.id}
                className="rounded-2xl border border-line bg-surface/50 p-4 sm:p-5"
              >
                <p className="text-[14px] text-ink">
                  {relation.interlocuteur?.nom ?? "Nom non communiqué"}
                  <span className="ml-2 text-[12px] text-muted-ink">
                    {relation.mon_role === "mentor" ? "accompagné" : "vous a accompagné"}
                  </span>
                </p>
                <p className="mt-1 text-[12px] text-muted-ink">
                  Du {formatDate(relation.demarree_le.slice(0, 10))}
                  {relation.terminee_le
                    ? ` au ${formatDate(relation.terminee_le.slice(0, 10))}`
                    : null}
                  {relation.motif_fin ? `, ${relation.motif_fin}` : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
