import { Atom, Info, TriangleAlert, Users } from "lucide-react";
import type { Metadata } from "next";

import { CartePole } from "@/components/poles/CartePole";
import { lirePoles, type ListePoles } from "@/lib/api-poles";

import { EnTetePage, EtatVide } from "../_ui";
import { StatutPoleEtiquette } from "./StatutPoleEtiquette";

export const metadata: Metadata = { title: "Pôles" };

export default async function PolesPage() {
  let donnees: ListePoles | null = null;
  try {
    donnees = await lirePoles();
  } catch {
    donnees = null;
  }

  const entete = (
    <EnTetePage
      icone={Atom}
      titre="Pôles"
      texte="Les pôles rassemblent les membres de la Cellule Scientifique autour d'un domaine. Demandez à rejoindre ceux qui vous intéressent."
    />
  );

  if (!donnees) {
    return (
      <div className="space-y-6">
        {entete}
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-300/60 bg-red-50 p-5 text-[14px] text-red-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>Impossible de charger les pôles pour le moment. Réessayez dans un instant.</p>
        </div>
      </div>
    );
  }

  const { demandes_en_attente: enAttente, max_demandes_en_attente: max } = donnees;

  return (
    <div className="space-y-6">
      {entete}

      <p className="flex items-start gap-2 rounded-xl border border-line bg-frost px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-blue" />
        <span>
          Demandes en attente : {enAttente}/{max}. Vous pouvez avoir au plus {max} demandes en
          attente en même temps ; annulez-en une pour en déposer une nouvelle. Après un refus, une
          nouvelle demande reste possible.
        </span>
      </p>

      {donnees.poles.length === 0 ? (
        <EtatVide
          icone={Atom}
          titre="Aucun pôle pour le moment"
          texte="Les pôles de la Cellule Scientifique apparaîtront ici dès leur création par le bureau."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {donnees.poles.map((p) => (
            <li key={p.id}>
              <CartePole
                nom={p.nom}
                description={p.description}
                icone={p.icone}
                href={`/cellule/poles/${p.id}`}
                signal={p.mon_statut === "valide"}
                indication={
                  p.mon_statut === "valide"
                    ? "Entrer dans le pôle"
                    : p.mon_statut === "en_attente"
                      ? "Voir ma demande"
                      : "Découvrir le pôle"
                }
                pastilles={
                  <>
                    <StatutPoleEtiquette statut={p.mon_statut} />
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
                      <Users aria-hidden="true" className="size-3.5 text-muted-ink" />
                      {p.nb_membres === 0
                        ? "Aucun membre"
                        : `${p.nb_membres} membre${p.nb_membres > 1 ? "s" : ""}`}
                    </span>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
