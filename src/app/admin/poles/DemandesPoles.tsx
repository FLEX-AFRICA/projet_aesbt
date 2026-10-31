import { Check, Clock, Inbox } from "lucide-react";
import Link from "next/link";

import type { DemandePole } from "@/lib/api-admin-poles";
import { formatDate } from "@/lib/format";

import { BoutonAction } from "../_composants/BoutonAction";
import { BoutonMotif } from "../_composants/BoutonMotif";
import { Avatar } from "../_gestion/Avatar";
import { EtatVide } from "../_gestion/EtatVide";
import { Pastille } from "../_gestion/Pastille";
import { refuserDemandePole, validerDemandePole } from "./actions";
import { MOTIFS_REFUS_POLE } from "./motifs";

/**
 * Demandes d'adhésion en attente. `poleId` est renseigné sur la page d'un pôle
 * (le nom du pôle n'est alors pas répété) et sert à revalider cette page.
 */
export function DemandesPoles({ demandes, poleId }: { demandes: DemandePole[]; poleId?: string }) {
  if (demandes.length === 0) {
    return (
      <EtatVide icone={Inbox} titre="Aucune demande en attente">
        Les nouvelles demandes d'adhésion apparaîtront ici.
      </EtatVide>
    );
  }

  return (
    <ul className="grid gap-3">
      {demandes.map((d) => (
        <li key={d.id} className="rounded-xl border border-[#C9961B]/30 bg-[#C9961B]/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <Avatar nom={d.nom || d.email} />
              <div className="min-w-0">
                <p className="truncate font-display text-[16px] text-ink">
                  {d.nom || d.email || "Compte sans nom"}
                </p>
                {d.email ? (
                  <a
                    href={`mailto:${d.email}`}
                    className="block truncate text-[13px] text-accent-blue hover:underline"
                  >
                    {d.email}
                  </a>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Pastille icone={Clock} ton="ambre">
                    En attente
                  </Pastille>
                  {poleId ? null : (
                    <Link
                      href={`/admin/poles/${d.pole_id}`}
                      className="text-[13px] font-semibold text-accent-blue hover:underline"
                    >
                      Pôle : {d.pole_nom}
                    </Link>
                  )}
                </div>
                <p className="mt-2 text-[13px] text-ink-soft">
                  {d.filiere_nom ?? "Filière non renseignée"}
                </p>
                {d.demande_le ? (
                  <p className="mt-1 text-[12px] text-muted-ink">
                    Demandé le {formatDate(d.demande_le.slice(0, 10))}
                  </p>
                ) : null}
                {d.message ? (
                  <p className="mt-2 max-w-[60ch] rounded-md bg-frost px-3 py-2 text-[13px] text-ink">
                    {d.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-2">
              <BoutonAction
                variante="principal"
                icone={<Check />}
                action={validerDemandePole.bind(null, d.id, poleId)}
              >
                Valider
              </BoutonAction>
              <BoutonMotif
                libelle="Refuser"
                titre="Refuser cette demande"
                aide="Le motif sera communiqué à la personne concernée."
                motifsFrequents={MOTIFS_REFUS_POLE}
                action={refuserDemandePole.bind(null, d.id, poleId)}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
