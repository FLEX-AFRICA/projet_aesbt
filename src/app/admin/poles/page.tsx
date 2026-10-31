import { Clock, Layers } from "lucide-react";

import { ErrorState } from "@/components/ui-aesbt/States";
import {
  listerDemandesPoles,
  listerPoles,
  messageErreurPole,
  type DemandePole,
  type PoleResume,
} from "@/lib/api-admin-poles";

import { EnTetePageAdmin } from "../_kit";
import { DemandesPoles } from "./DemandesPoles";
import { ListePoles } from "./ListePoles";

export const metadata = { title: "Pôles de la Cellule Scientifique" };

export default async function PolesPage() {
  let poles: PoleResume[] = [];
  let demandes: DemandePole[] = [];
  let erreur: string | null = null;
  try {
    [poles, demandes] = await Promise.all([listerPoles(), listerDemandesPoles()]);
  } catch (err) {
    erreur = messageErreurPole(err, "Les pôles n'ont pas pu être chargés.");
  }

  return (
    <div className="grid gap-8">
      <EnTetePageAdmin
        icone={Layers}
        titre="Pôles de la Cellule Scientifique"
        description="Les pôles regroupent les membres de la Cellule par domaine. Validez les demandes d'adhésion et gérez les membres de chaque pôle."
      />

      {erreur ? (
        <ErrorState message={erreur} />
      ) : (
        <>
          {demandes.length > 0 ? (
            <section aria-labelledby="demandes-attente" className="grid gap-3">
              <h2
                id="demandes-attente"
                className="flex items-center gap-2.5 font-display text-lg tracking-tight text-ink"
              >
                <Clock aria-hidden="true" className="size-5 text-[#8a6610]" />
                Demandes en attente ({demandes.length})
              </h2>
              <DemandesPoles demandes={demandes} />
            </section>
          ) : null}

          <section aria-labelledby="liste-poles" className="grid gap-3">
            <h2 id="liste-poles" className="font-display text-lg tracking-tight text-ink">
              Tous les pôles
            </h2>
            <ListePoles poles={poles} />
          </section>
        </>
      )}
    </div>
  );
}
