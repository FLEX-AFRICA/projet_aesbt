import { Ban, CircleCheck, Eye, Inbox, MailOpen, Mail, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { appelApi } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { marquerMessage } from "../actions";
import { BoutonAction } from "../_composants/BoutonAction";
import { Avatar } from "../_gestion/Avatar";
import { EtatVide } from "../_gestion/EtatVide";
import { OngletsFiltre } from "../_gestion/OngletsFiltre";
import { Pastille, type TonPastille } from "../_gestion/Pastille";
import { EnTetePageAdmin } from "../_kit";

export const metadata = { title: "Messages" };

interface Message {
  id: string;
  nom: string;
  email: string;
  sujet: string | null;
  message: string;
  statut: string;
  created_at: string;
}

const STATUTS: { valeur: string; libelle: string; icone: LucideIcon; ton: TonPastille }[] = [
  { valeur: "nouveau", libelle: "Nouveau", icone: Mail, ton: "accent" },
  { valeur: "lu", libelle: "Lu", icone: Eye, ton: "gris" },
  { valeur: "traite", libelle: "Traité", icone: CircleCheck, ton: "vert" },
  { valeur: "indesirable", libelle: "Indésirable", icone: Ban, ton: "rouge" },
];

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtre = STATUTS.some((s) => s.valeur === statut) ? statut : undefined;
  const { messages: tous } = await appelApi<{ messages: Message[] }>("/api/v1/admin/messages");
  const messages = filtre ? tous.filter((m) => m.statut === filtre) : tous;
  const compte = (valeur: string) => tous.filter((m) => m.statut === valeur).length;

  return (
    <div>
      <EnTetePageAdmin
        titre="Messages de contact"
        description="Les messages sont conservés ici plutôt que relayés par courriel, ce qui évite de faire de l'API un relais de courrier indésirable."
      />

      {tous.length > 0 ? (
        <div className="mt-6">
          <OngletsFiltre
            libelle="Filtrer par statut"
            onglets={[
              { libelle: "Tous", href: "/admin/messages", actif: !filtre, compte: tous.length },
              ...STATUTS.map((st) => ({
                libelle: st.libelle,
                href: `/admin/messages?statut=${st.valeur}`,
                actif: filtre === st.valeur,
                compte: compte(st.valeur),
                urgent: st.valeur === "nouveau",
              })),
            ]}
          />
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="mt-8">
          <EtatVide icone={tous.length === 0 ? Inbox : MailOpen} titre="Aucun message">
            {tous.length === 0 ? (
              "Les messages envoyés depuis le formulaire de contact apparaîtront ici."
            ) : (
              <Link href="/admin/messages" className="font-semibold text-accent-blue underline">
                Voir tous les messages
              </Link>
            )}
          </EtatVide>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((m) => {
            const info = STATUTS.find((st) => st.valeur === m.statut);
            return (
              <li key={m.id} className="rounded-xl border border-line bg-surface/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <Avatar nom={m.nom} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pastille icone={info?.icone} ton={info?.ton ?? "gris"}>
                          {info?.libelle ?? m.statut}
                        </Pastille>
                        <span className="text-[12px] text-muted-ink">
                          {formatDate(m.created_at.slice(0, 10))}
                        </span>
                      </div>

                      <p className="mt-2 font-display text-[16px] text-ink">
                        {m.nom}{" "}
                        <a
                          href={`mailto:${m.email}`}
                          className="text-[13px] font-normal text-accent-blue hover:underline"
                        >
                          {m.email}
                        </a>
                      </p>
                      {m.sujet ? (
                        <p className="mt-1 text-[14px] font-medium text-ink-soft">{m.sujet}</p>
                      ) : null}
                      <p className="mt-2 max-w-[70ch] whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
                        {m.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    {m.statut === "nouveau" ? (
                      <BoutonAction icone={<Eye />} action={marquerMessage.bind(null, m.id, "lu")}>
                        Marquer lu
                      </BoutonAction>
                    ) : null}
                    {m.statut !== "traite" ? (
                      <BoutonAction
                        variante="principal"
                        icone={<CircleCheck />}
                        action={marquerMessage.bind(null, m.id, "traite")}
                      >
                        Traité
                      </BoutonAction>
                    ) : null}
                    {m.statut !== "indesirable" ? (
                      <BoutonAction
                        variante="danger"
                        icone={<Ban />}
                        action={marquerMessage.bind(null, m.id, "indesirable")}
                      >
                        Indésirable
                      </BoutonAction>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
