import {
  FileText,
  FilePlus2,
  Flag,
  HandHeart,
  Handshake,
  Mail,
  MessageSquareQuote,
  PenLine,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { appelApi, sessionCourante } from "@/lib/api-admin";
import { formatDate } from "@/lib/format";

import { ActiviteRecente, type EntreeAudit } from "./_tableau-de-bord/ActiviteRecente";
import { BlocATraiter } from "./_tableau-de-bord/BlocATraiter";
import { CarteIndisponible } from "./_tableau-de-bord/CarteIndisponible";
import { CarteKpi, type Tendance } from "./_tableau-de-bord/CarteKpi";
import { charger } from "./_tableau-de-bord/chargement";
import { GraphiqueActivite, type PointActivite } from "./_tableau-de-bord/GraphiqueActivite";
import { RaccourcisRapides } from "./_tableau-de-bord/RaccourcisRapides";
import { lireSoumissions, type Soumission } from "./editeur/_lib/detail";
import { pageEditable } from "./editeur/_lib/pages";

export const metadata = { title: "Tableau de bord" };

interface TableauDeBord {
  comptes: Record<string, number>;
  demandes_en_attente: number;
  relations_actives: number;
  messages_non_lus: number;
  signalements_nouveaux: number;
}

/** Formule d'accueil selon l'heure (fuseau de Paris, indépendant du serveur). */
function salutation(): string {
  const heure = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: "Europe/Paris" })
      .formatToParts(new Date())
      .find((p) => p.type === "hour")?.value ?? "12",
  );
  return heure >= 18 || heure < 5 ? "Bonsoir" : "Bonjour";
}

/** Prénom affiché : premier mot du nom, à défaut la partie locale de l'e-mail. */
function prenom(nom: string | null | undefined, email: string | undefined): string | null {
  const source = nom?.trim() || email?.split("@")[0] || "";
  return source.split(/\s+/)[0] || null;
}

/** Mois précédent et mois en cours d'une série, si elle en compte au moins deux. */
function tendance(
  serie: PointActivite[] | null,
  cle: "inscriptions" | "publications" | "relations",
): Tendance | undefined {
  if (!serie || serie.length < 2) return undefined;
  const courant = serie.at(-1);
  const precedent = serie.at(-2);
  if (!courant || !precedent) return undefined;
  return { courant: courant[cle], precedent: precedent[cle] };
}

export default async function TableauDeBordPage() {
  // Chaque source est isolée : un échec n'affecte que la carte qui en dépend.
  const [session, donnees, activite, audit, soumissions, ressources, temoignages] =
    await Promise.all([
      sessionCourante(),
      charger<TableauDeBord>("/api/v1/admin/tableau-de-bord"),
      charger<{ serie: PointActivite[] }>("/api/v1/admin/activite"),
      charger<{ entrees: EntreeAudit[] }>("/api/v1/admin/audit?taille=8"),
      appelApi<unknown>("/api/v1/admin/contenus/soumissions").then(
        (brut): Soumission[] | null => lireSoumissions(brut),
        () => null,
      ),
      charger<{ ressources: unknown[] }>("/api/v1/admin/ressources?statut=propose"),
      charger<{ temoignages: unknown[] }>("/api/v1/admin/temoignages/en-attente"),
    ]);

  const d = donnees.ok ? donnees.donnees : null;
  const serie = activite.ok ? activite.donnees.serie : null;
  const enAttente = d ? (d.comptes["en_attente"] ?? 0) : null;
  const propositions =
    ressources.ok && temoignages.ok
      ? ressources.donnees.ressources.length + temoignages.donnees.temoignages.length
      : null;
  const nom = prenom(session?.nom, session?.email);
  const dateDuJour = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(new Date());

  return (
    <div className="grid gap-8">
      <header>
        <p className="text-[13px] capitalize text-muted-ink">{dateDuJour}</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          {salutation()}
          {nom ? ` ${nom}` : ""}
        </h1>
        <p className="mt-2 max-w-[70ch] text-[15px] text-muted-ink">
          Voici l'état de l'association aujourd'hui. Commencez par ce qui attend une décision.
        </p>
      </header>

      <BlocATraiter
        elements={[
          {
            cle: "inscriptions",
            libelle: "Inscriptions en attente de validation",
            nombre: enAttente,
            href: "/admin/comptes?statut=en_attente",
            action: "Valider",
            icone: UserCheck,
          },
          {
            cle: "signalements",
            libelle: "Signalements à traiter",
            nombre: d ? d.signalements_nouveaux : null,
            href: "/admin/moderation",
            action: "Modérer",
            icone: Flag,
          },
          {
            cle: "messages",
            libelle: "Messages de contact non lus",
            nombre: d ? d.messages_non_lus : null,
            href: "/admin/messages",
            action: "Lire",
            icone: Mail,
          },
          {
            cle: "propositions",
            libelle: "Ressources et témoignages à modérer",
            nombre: propositions,
            href: "/admin/moderation",
            action: "Examiner",
            icone: MessageSquareQuote,
          },
          {
            cle: "pages",
            libelle: "Pages en attente de validation",
            nombre: soumissions ? soumissions.length : null,
            href: "/admin/editeur",
            action: "Relire",
            icone: PenLine,
          },
        ]}
      />

      {soumissions && soumissions.length > 0 ? (
        <section aria-labelledby="titre-soumissions">
          <h2 id="titre-soumissions" className="font-display text-lg tracking-tight text-ink">
            Contenus à valider
          </h2>
          <ul className="mt-4 divide-y divide-line/70 overflow-hidden rounded-2xl border border-line bg-surface/60">
            {soumissions.map((s) => (
              <li key={s.page} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                <FileText aria-hidden className="size-4 shrink-0 text-muted-ink" />
                <div className="min-w-0 flex-1 text-[14px] text-ink-soft">
                  <span className="font-medium text-ink">
                    {pageEditable(s.page)?.titre ?? s.page}
                  </span>
                  {" : soumis par "}
                  {s.soumisParNom ?? "un éditeur"} le {formatDate(s.soumisLe.slice(0, 10))}
                  {s.note ? (
                    <span className="block break-words text-[13px] text-muted-ink">
                      « {s.note} »
                    </span>
                  ) : null}
                </div>
                <Link
                  href={`/admin/editeur/${s.page}`}
                  className="rounded-full bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2"
                >
                  Relire et valider
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="titre-indicateurs">
        <h2 id="titre-indicateurs" className="font-display text-lg tracking-tight text-ink">
          Indicateurs
        </h2>
        {d ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteKpi
              valeur={d.comptes["valide"] ?? 0}
              libelle="Comptes validés"
              icone={Users}
              href="/admin/comptes?statut=valide"
              tendance={tendance(serie, "inscriptions")}
            />
            <CarteKpi
              valeur={d.relations_actives}
              libelle="Relations de mentorat actives"
              icone={Handshake}
              tendance={tendance(serie, "relations")}
            />
            <CarteKpi
              valeur={d.demandes_en_attente}
              libelle="Demandes de mentorat en attente"
              icone={HandHeart}
            />
            <CarteKpi
              valeur={serie?.at(-1)?.publications ?? 0}
              libelle="Publications ce mois-ci"
              icone={FilePlus2}
              href="/admin/publications"
              tendance={tendance(serie, "publications")}
            />
          </div>
        ) : (
          <div className="mt-4">
            <CarteIndisponible titre="Indicateurs" />
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <ActiviteRecente audit={audit} />
        <RaccourcisRapides />
      </div>

      <section aria-labelledby="titre-tendances">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titre-tendances" className="font-display text-lg tracking-tight text-ink">
            Six derniers mois
          </h2>
          <Link
            href="/admin/statistiques"
            className="rounded-sm text-[13px] font-semibold text-accent-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40"
          >
            Statistiques de l'association
          </Link>
        </div>
        <div className="mt-4 rounded-2xl border border-line bg-surface/60 p-4 sm:p-6">
          {serie ? (
            serie.length > 0 ? (
              <GraphiqueActivite serie={serie} />
            ) : (
              <p className="text-center text-[14px] text-muted-ink">
                Pas encore assez de données pour tracer l'activité.
              </p>
            )
          ) : (
            <CarteIndisponible titre="Graphique d'activité" />
          )}
        </div>
      </section>
    </div>
  );
}
