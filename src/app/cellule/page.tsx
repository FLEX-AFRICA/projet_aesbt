import {
  ArrowRight,
  Atom,
  BookOpen,
  Clock,
  ExternalLink,
  HeartHandshake,
  ShieldCheck,
  Inbox,
  Library,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { IconeNotification } from "@/components/notifications/presentation";
import { appelApi, sessionCourante } from "@/lib/api-admin";
import { lireNotifications, type Notification } from "@/lib/api-poles";
import { cn } from "@/lib/utils";

import { basculeVersAdministration } from "./_bascule";
import { Badge, classeCarte, classeLienPrimaire, EtatVide } from "./_ui";

interface Demande {
  id: string;
  statut: string;
  interlocuteur_nom: string | null;
}

interface Relation {
  id: string;
  statut: string;
  mon_role: string;
  interlocuteur: { nom?: string } | undefined;
}

interface Ressource {
  id: string;
  titre: string;
  url: string | null;
  categorie: string | null;
  filiere_nom: string | null;
}

interface Proposition {
  id: string;
  statut: string;
}

function Tuile({
  icone: Icone,
  titre,
  valeur,
  detail,
  lien,
  accent,
}: {
  icone: LucideIcon;
  titre: string;
  valeur: string;
  detail: string;
  lien: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={lien}
      className={cn(
        classeCarte,
        "group flex flex-col gap-3 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
        accent && "border-accent-blue/40 bg-accent-blue/[0.04]",
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue"
      >
        <Icone className="size-[18px]" />
      </span>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-ink">
          {titre}
        </p>
        <p className="mt-1 font-display text-xl leading-snug text-ink">{valeur}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-ink">{detail}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-accent-blue">
        Ouvrir
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

function Action({
  href,
  icone: Icone,
  libelle,
}: {
  href: string;
  icone: LucideIcon;
  libelle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-frost-deep/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
    >
      <Icone aria-hidden="true" className="size-4 text-accent-blue" />
      {libelle}
    </Link>
  );
}

export default async function CellulePage() {
  const session = await sessionCourante();
  const estMentor = session?.role === "mentor" || session?.role === "admin";

  const [demandes, relations, recentes, propositions, recues, notifs] = await Promise.all([
    appelApi<{ demandes: Demande[] }>("/api/v1/mentorat/demandes?role=etudiant").catch(() => ({
      demandes: [] as Demande[],
    })),
    appelApi<{ relations: Relation[] }>("/api/v1/mentorat/relations").catch(() => ({
      relations: [] as Relation[],
    })),
    appelApi<{ ressources: Ressource[] }>("/api/v1/ressources/membres?taille=3").catch(() => ({
      ressources: [] as Ressource[],
    })),
    appelApi<{ ressources: Proposition[] }>("/api/v1/ressources/mes-propositions").catch(() => ({
      ressources: [] as Proposition[],
    })),
    // Demandes reçues, uniquement pour un mentor.
    estMentor
      ? appelApi<{ demandes: Demande[] }>("/api/v1/mentorat/demandes?role=mentor")
          .then((r) => r.demandes.filter((d) => d.statut === "en_attente"))
          .catch(() => [] as Demande[])
      : Promise.resolve([] as Demande[]),
    lireNotifications(1, 3, true).catch(() => null),
  ]);

  const enAttente = demandes.demandes.filter((d) => d.statut === "en_attente");
  const actives = relations.relations.filter((r) => r.statut === "active");
  const propositionsEnAttente = propositions.ressources.filter((p) => p.statut === "propose");
  const bascule = session ? basculeVersAdministration(session) : null;
  const prenom = session?.nom ? session.nom.split(" ")[0] : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-blue">
          Cellule Scientifique
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Bonjour{prenom ? `, ${prenom}` : ""}
        </h1>
        <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-muted-ink">
          La Cellule met en relation les nouveaux étudiants et les plus avancés, et rassemble les
          ressources utiles à chaque filière.
        </p>
      </header>

      {bascule ? (
        <section
          aria-label="Accès à l'espace de gestion"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue"
            >
              <ShieldCheck className="size-5" />
            </span>
            <p className="font-display text-[17px] leading-snug text-ink">
              {bascule.libelle === "Administration"
                ? "Vous avez accès à l'administration du site."
                : "Vous avez accès à l'espace éditeur du site."}
            </p>
          </div>
          <Link href={bascule.href} className={classeLienPrimaire}>
            Ouvrir : {bascule.libelle}
          </Link>
        </section>
      ) : null}

      {recues.length > 0 ? (
        <section
          aria-label="Demandes reçues"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-blue/40 bg-accent-blue/[0.04] p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue text-primary-foreground"
            >
              <Inbox className="size-5" />
            </span>
            <p className="font-display text-[17px] leading-snug text-ink">
              {recues.length === 1
                ? "Un étudiant souhaite être accompagné par vous."
                : `${recues.length} étudiants souhaitent être accompagnés par vous.`}
            </p>
          </div>
          <Link href="/cellule/mentorat" className={classeLienPrimaire}>
            Voir les demandes
          </Link>
        </section>
      ) : null}

      <section
        aria-label="Mon tableau de bord"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {actives.length > 0 ? (
          <Tuile
            icone={HeartHandshake}
            titre="Mentorat"
            valeur={
              actives.length === 1
                ? "Accompagnement en cours"
                : `${actives.length} accompagnements en cours`
            }
            detail="Les coordonnées de chaque interlocuteur restent visibles tant que la relation est active."
            lien="/cellule/mentorat"
            accent
          />
        ) : enAttente.length > 0 ? (
          <Tuile
            icone={Clock}
            titre="Mentorat"
            valeur="Demande en attente"
            detail="Sans réponse du mentor, la demande expirera au bout de trente jours et vous pourrez en solliciter un autre."
            lien="/cellule/mentorat"
          />
        ) : (
          <Tuile
            icone={Search}
            titre="Mentorat"
            valeur="Trouver un mentor"
            detail="Un étudiant plus avancé de votre filière peut vous accompagner. Ses coordonnées ne sont communiquées que s'il accepte."
            lien="/cellule/mentors"
            accent
          />
        )}

        <Tuile
          icone={Inbox}
          titre="Demandes"
          valeur={
            enAttente.length === 0
              ? "Aucune demande en attente"
              : enAttente.length === 1
                ? "1 demande en attente"
                : `${enAttente.length} demandes en attente`
          }
          detail={
            estMentor
              ? `${recues.length} demande${recues.length > 1 ? "s" : ""} reçue${recues.length > 1 ? "s" : ""} à traiter.`
              : "Suivez ici les réponses des mentors que vous avez sollicités."
          }
          lien="/cellule/mentorat"
        />

        <Tuile
          icone={Library}
          titre="Ressources"
          valeur={
            propositionsEnAttente.length > 0
              ? `${propositionsEnAttente.length} proposition${propositionsEnAttente.length > 1 ? "s" : ""} à l'étude`
              : "Ressources partagées"
          }
          detail="Consultez ce que les membres partagent entre eux et proposez vos propres références : elles restent réservées aux membres connectés."
          lien={
            propositionsEnAttente.length > 0
              ? "/cellule/ressources"
              : "/cellule/communaute/ressources"
          }
        />
      </section>

      <section aria-labelledby="actions-rapides">
        <h2 id="actions-rapides" className="font-display text-lg tracking-tight text-ink">
          Actions rapides
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Action href="/cellule/mentors" icone={Search} libelle="Parcourir les mentors" />
          <Action href="/cellule/mentorat" icone={HeartHandshake} libelle="Mon mentorat" />
          <Action href="/cellule/poles" icone={Atom} libelle="Rejoindre un pôle" />
          <Action
            href="/cellule/communaute/ressources"
            icone={BookOpen}
            libelle="Ressources partagées"
          />
          <Action href="/cellule/profil" icone={UserRound} libelle="Compléter mon profil" />
        </div>
      </section>

      {notifs && notifs.notifications.length > 0 ? (
        <section aria-labelledby="notifs-recentes">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="notifs-recentes" className="font-display text-lg tracking-tight text-ink">
              Notifications non lues ({notifs.non_lues})
            </h2>
            <Link
              href="/cellule/notifications"
              className="text-[13px] font-semibold text-accent-blue hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <ul className="mt-3 grid gap-2">
            {notifs.notifications.map((n: Notification) => (
              <li key={n.id}>
                <Link
                  href={
                    n.lien && n.lien.startsWith("/") && !n.lien.startsWith("//")
                      ? n.lien
                      : "/cellule/notifications"
                  }
                  className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 hover:bg-frost-deep/50"
                >
                  <IconeNotification
                    type={n.type}
                    className="mt-0.5 size-4 shrink-0 text-accent-blue"
                  />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold text-ink">
                      {n.titre}
                      <span className="sr-only"> (Non lue)</span>
                    </span>
                    <span className="block text-[13px] text-muted-ink">{n.message}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="ressources-recentes">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="ressources-recentes" className="font-display text-lg tracking-tight text-ink">
            Dernières ressources partagées
          </h2>
          <Link
            href="/cellule/communaute/ressources"
            className="text-[13px] font-semibold text-accent-blue hover:underline"
          >
            Tout voir
          </Link>
        </div>

        {recentes.ressources.length === 0 ? (
          <EtatVide
            className="mt-3"
            icone={Library}
            titre="Aucune ressource pour le moment"
            texte="Les ressources partagées par la communauté apparaîtront ici."
          />
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {recentes.ressources.map((r) => (
              <li key={r.id} className={cn(classeCarte, "flex flex-col gap-2 p-4 sm:p-4")}>
                {r.categorie || r.filiere_nom ? (
                  <Badge ton="neutre">{r.categorie ?? r.filiere_nom}</Badge>
                ) : null}
                <p className="font-display text-[15px] leading-snug text-ink">{r.titre}</p>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-accent-blue hover:underline"
                  >
                    Consulter
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
