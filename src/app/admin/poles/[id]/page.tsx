import { CircleCheck, EyeOff, Layers } from "lucide-react";
import { notFound } from "next/navigation";

import { iconePole } from "@/components/poles/icones-poles";
import { ErrorState } from "@/components/ui-aesbt/States";
import { lireDetailPole, messageErreurPole, type DetailPole } from "@/lib/api-admin-poles";
import { ApiErreur } from "@/lib/api-admin";

import { Pastille } from "../../_gestion/Pastille";
import { EnTetePageAdmin } from "../../_kit";
import { DemandesPoles } from "../DemandesPoles";
import { MembresPole } from "../MembresPole";

export const metadata = { title: "Détail du pôle" };

export default async function DetailPolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let detail: DetailPole | null = null;
  let erreur: string | null = null;
  try {
    detail = await lireDetailPole(id);
  } catch (err) {
    if (err instanceof ApiErreur && err.statut === 404) notFound();
    erreur = messageErreurPole(err, "Le pôle n'a pas pu être chargé.");
  }

  const filAriane = [
    { libelle: "Pôles", href: "/admin/poles" },
    { libelle: detail?.pole.nom ?? "Détail" },
  ];

  if (erreur || !detail) {
    return (
      <div className="grid gap-6">
        <EnTetePageAdmin icone={Layers} titre="Pôle" filAriane={filAriane} />
        <ErrorState message={erreur ?? "Le pôle n'a pas pu être chargé."} />
      </div>
    );
  }

  const { pole, membres, demandes } = detail;
  const demandesPole = demandes.map((d) => ({
    id: d.adhesion_id,
    pole_id: pole.id,
    user_id: d.user_id,
    message: d.message,
    demande_le: d.demande_le,
    pole_nom: pole.nom,
    nom: d.nom,
    email: d.email,
    filiere_nom: d.filiere_nom,
  }));

  return (
    <div className="grid gap-8">
      <EnTetePageAdmin
        icone={iconePole(pole.icone)}
        titre={pole.nom}
        filAriane={filAriane}
        description={pole.description || "Aucune description."}
      >
        {pole.actif ? (
          <Pastille icone={CircleCheck} ton="vert">
            Actif
          </Pastille>
        ) : (
          <Pastille icone={EyeOff} ton="gris">
            Inactif
          </Pastille>
        )}
      </EnTetePageAdmin>

      {demandesPole.length > 0 ? (
        <section aria-labelledby="demandes-pole" className="grid gap-3">
          <h2 id="demandes-pole" className="font-display text-lg tracking-tight text-ink">
            Demandes en attente ({demandesPole.length})
          </h2>
          <DemandesPoles demandes={demandesPole} poleId={pole.id} />
        </section>
      ) : null}

      <section aria-labelledby="membres-pole" className="grid gap-3">
        <h2 id="membres-pole" className="font-display text-lg tracking-tight text-ink">
          Membres ({membres.length})
        </h2>
        <MembresPole poleId={pole.id} poleNom={pole.nom} poleActif={pole.actif} membres={membres} />
      </section>
    </div>
  );
}
