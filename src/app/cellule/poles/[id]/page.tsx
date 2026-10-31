import { ArrowLeft, Lock, TriangleAlert, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PastilleIconePole } from "@/components/poles/PastilleIconePole";
import { ApiErreur } from "@/lib/api-admin";
import { lireMembresPole, lirePoles, type ListePoles } from "@/lib/api-poles";

import { classeCarte } from "../../_ui";
import { ActionsPole } from "../ActionsPole";
import { StatutPoleEtiquette } from "../StatutPoleEtiquette";

export const metadata: Metadata = { title: "Pôle" };

export default async function PolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let donnees: ListePoles | null = null;
  try {
    donnees = await lirePoles();
  } catch {
    donnees = null;
  }

  const retour = (
    <Link
      href="/cellule/poles"
      className="inline-flex w-fit items-center gap-1.5 rounded-md text-[13px] font-semibold text-accent-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Retour aux pôles
    </Link>
  );

  if (!donnees) {
    return (
      <div className="space-y-6">
        {retour}
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-300/60 bg-red-50 p-5 text-[14px] text-red-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>Impossible de charger ce pôle pour le moment. Réessayez dans un instant.</p>
        </div>
      </div>
    );
  }

  const pole = donnees.poles.find((p) => p.id === id);
  if (!pole) notFound();

  // Les noms des membres ne sont lisibles que par les membres validés (403 sinon).
  let membres: string[] | null = null;
  let reserve = pole.mon_statut !== "valide";
  if (!reserve) {
    try {
      membres = await lireMembresPole(pole.id);
    } catch (err) {
      if (err instanceof ApiErreur && err.statut === 403) reserve = true;
    }
  }

  const quotaAtteint = donnees.demandes_en_attente >= donnees.max_demandes_en_attente;

  return (
    <div className="space-y-6">
      {retour}

      <header className="flex items-start gap-4">
        <PastilleIconePole icone={pole.icone} className="size-12" iconeClassName="size-6" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink">{pole.nom}</h1>
          <p className="mt-1.5 max-w-[70ch] text-[15px] leading-relaxed text-muted-ink">
            {pole.description || "Aucune description."}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-soft">
            <Users aria-hidden="true" className="size-4 text-muted-ink" />
            {pole.nb_membres === 0
              ? "Aucun membre pour le moment"
              : `${pole.nb_membres} membre${pole.nb_membres > 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

      <section aria-labelledby="mon-statut" className={`${classeCarte} grid gap-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="mon-statut" className="font-display text-lg text-ink">
            Mon statut
          </h2>
          {pole.mon_statut ? (
            <StatutPoleEtiquette statut={pole.mon_statut} />
          ) : (
            <span className="text-[13px] text-muted-ink">
              Vous ne faites pas partie de ce pôle.
            </span>
          )}
        </div>

        {pole.mon_statut === "refuse" ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] leading-relaxed text-red-900">
            {pole.mon_motif_refus
              ? `Motif du refus : ${pole.mon_motif_refus}`
              : "Votre demande a été refusée. Vous pouvez en déposer une nouvelle."}
          </p>
        ) : null}

        <ActionsPole pole={pole} quotaAtteint={quotaAtteint} />
      </section>

      <section aria-labelledby="membres-pole" className={`${classeCarte} grid gap-3`}>
        <h2 id="membres-pole" className="font-display text-lg text-ink">
          Membres{membres ? ` (${membres.length})` : ""}
        </h2>
        {reserve ? (
          <p className="flex items-start gap-2 text-[14px] text-muted-ink">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            La liste des membres est réservée aux membres de ce pôle.
          </p>
        ) : membres === null ? (
          <p className="text-[14px] text-muted-ink">
            La liste des membres n'a pas pu être chargée pour le moment.
          </p>
        ) : membres.length === 0 ? (
          <p className="text-[14px] text-muted-ink">Aucun membre à afficher.</p>
        ) : (
          <ul className="grid gap-1.5 text-[14px] text-ink sm:grid-cols-2">
            {membres.map((nom, i) => (
              <li key={`${nom}-${i}`}>{nom}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
