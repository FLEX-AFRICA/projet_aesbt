import {
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  Compass,
  GraduationCap,
  PenLine,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserSearch,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { appelApi } from "@/lib/api-admin";
import { libelleDroit } from "@/components/droits/catalogue";
import { formatDate } from "@/lib/format";

import { changerRole, changerStatutCompte, refuserCompte, validerCompte } from "../actions";
import { BoutonAction } from "../_composants/BoutonAction";
import { BoutonMotif } from "../_composants/BoutonMotif";
import { Avatar } from "../_gestion/Avatar";
import { EtatVide } from "../_gestion/EtatVide";
import { MOTIFS_REFUS_COMPTE } from "../_gestion/motifs";
import { OngletsFiltre } from "../_gestion/OngletsFiltre";
import { Pastille, type TonPastille } from "../_gestion/Pastille";
import { Recherche } from "../_gestion/Recherche";
import { EnTetePageAdmin } from "../_kit";

export const metadata = { title: "Comptes" };

interface Compte {
  user_id: string;
  role: string;
  statut: string;
  created_at: string;
  valide_le: string | null;
  refus_motif: string | null;
  filiere_nom: string | null;
  /** Fournis par l'API depuis la liaison avec le compte d'authentification. */
  nom?: string | null;
  email?: string | null;
  /** Droits d'un éditeur ; absent ou vide pour les autres rôles. */
  droits?: string[];
}

const TAILLE = 100;

const STATUTS: { valeur: string; libelle: string }[] = [
  { valeur: "en_attente", libelle: "En attente" },
  { valeur: "valide", libelle: "Validés" },
  { valeur: "suspendu", libelle: "Suspendus" },
  { valeur: "refuse", libelle: "Refusés" },
];

/** Libellé, icône et ton de chaque statut ; un statut inconnu s'affiche tel quel. */
const INFOS_STATUT: Record<string, { libelle: string; icone: LucideIcon; ton: TonPastille }> = {
  en_attente: { libelle: "En attente", icone: Clock, ton: "ambre" },
  valide: { libelle: "Validé", icone: CircleCheck, ton: "vert" },
  refuse: { libelle: "Refusé", icone: CircleX, ton: "rouge" },
  suspendu: { libelle: "Suspendu", icone: Ban, ton: "gris" },
};

/** Libellés français des rôles ; un rôle inconnu s'affiche tel quel. */
const INFOS_ROLE: Record<string, { libelle: string; icone: LucideIcon; ton: TonPastille }> = {
  etudiant: { libelle: "Étudiant", icone: GraduationCap, ton: "gris" },
  mentor: { libelle: "Mentor", icone: Compass, ton: "accent" },
  editeur: { libelle: "Éditeur", icone: PenLine, ton: "ambre" },
  admin: { libelle: "Administrateur", icone: ShieldCheck, ton: "rouge" },
};

const ROLES = Object.keys(INFOS_ROLE);

function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default async function ComptesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; role?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filtre = STATUTS.some((f) => f.valeur === params.statut) ? params.statut : undefined;
  const filtreRole = ROLES.includes(params.role ?? "") ? params.role : undefined;
  const recherche = (params.q ?? "").trim().slice(0, 100);

  const [{ comptes }, tableau] = await Promise.all([
    appelApi<{ comptes: Compte[] }>(
      `/api/v1/admin/comptes?taille=${TAILLE}${filtre ? `&statut=${filtre}` : ""}`,
    ),
    // Les compteurs ne doivent jamais empêcher d'afficher la liste.
    appelApi<{ comptes: Record<string, number> }>("/api/v1/admin/tableau-de-bord").catch(
      () => null,
    ),
  ]);

  const parStatut = tableau?.comptes ?? null;
  const total = parStatut ? Object.values(parStatut).reduce((a, b) => a + b, 0) : undefined;

  const parRole = (role: string) => comptes.filter((c) => c.role === role).length;
  const requete = normaliser(recherche);
  const visibles = comptes.filter((c) => {
    if (filtreRole && c.role !== filtreRole) return false;
    if (!requete) return true;
    return normaliser(`${c.nom ?? ""} ${c.email ?? ""} ${c.filiere_nom ?? ""}`).includes(requete);
  });

  const lien = (cible: { statut?: string | undefined; role?: string | undefined }) => {
    const p = new URLSearchParams();
    if (cible.statut) p.set("statut", cible.statut);
    if (cible.role) p.set("role", cible.role);
    if (recherche) p.set("q", recherche);
    const texte = p.toString();
    return texte ? `/admin/comptes?${texte}` : "/admin/comptes";
  };

  const enAttente = parStatut?.["en_attente"] ?? 0;
  const filtresActifs = Boolean(filtre || filtreRole || recherche);

  return (
    <div className="grid gap-6">
      <EnTetePageAdmin
        titre="Comptes"
        description="Un compte en attente ne peut rien faire sur la plateforme tant qu'il n'est pas validé."
      />

      {enAttente > 0 && filtre !== "en_attente" ? (
        <Link
          href={lien({ statut: "en_attente" })}
          className="flex items-center gap-3 rounded-xl border border-[#C9961B]/30 bg-[#C9961B]/10 px-4 py-3 text-[14px] text-[#8a6610] transition-colors hover:bg-[#C9961B]/15"
        >
          <Clock aria-hidden="true" className="size-4 shrink-0" />
          <span>
            <strong className="font-semibold">
              {enAttente} inscription{enAttente > 1 ? "s" : ""} en attente
            </strong>{" "}
            de validation. Afficher la file.
          </span>
        </Link>
      ) : null}

      <div className="grid gap-3">
        <OngletsFiltre
          libelle="Filtrer par statut"
          onglets={[
            { libelle: "Tous", href: lien({ role: filtreRole }), actif: !filtre, compte: total },
            ...STATUTS.map((s) => ({
              libelle: s.libelle,
              href: lien({ statut: s.valeur, role: filtreRole }),
              actif: filtre === s.valeur,
              compte: parStatut ? (parStatut[s.valeur] ?? 0) : undefined,
              urgent: s.valeur === "en_attente",
            })),
          ]}
        />
        <OngletsFiltre
          libelle="Filtrer par rôle"
          onglets={[
            { libelle: "Tous les rôles", href: lien({ statut: filtre }), actif: !filtreRole },
            ...ROLES.map((r) => ({
              libelle: INFOS_ROLE[r]?.libelle ?? r,
              href: lien({ statut: filtre, role: r }),
              actif: filtreRole === r,
              compte: parRole(r),
            })),
          ]}
        />
        <Recherche
          action="/admin/comptes"
          valeur={recherche}
          placeholder="Rechercher un nom, un e-mail ou une filière"
          conserves={{ statut: filtre, role: filtreRole }}
        />
      </div>

      {visibles.length === 0 ? (
        <EtatVide icone={filtresActifs ? UserSearch : UsersRound} titre="Aucun compte trouvé">
          {filtresActifs ? (
            <>
              Aucun compte ne correspond à ces filtres.{" "}
              <Link href="/admin/comptes" className="font-semibold text-accent-blue underline">
                Réinitialiser
              </Link>
            </>
          ) : (
            "Les inscriptions apparaîtront ici dès qu'elles arriveront."
          )}
        </EtatVide>
      ) : (
        <ul className="grid gap-3">
          {visibles.map((compte) => {
            const statut = INFOS_STATUT[compte.statut];
            const role = INFOS_ROLE[compte.role];
            const affichage = compte.nom || compte.email || "Compte sans nom";
            return (
              <li key={compte.user_id} className="rounded-xl border border-line bg-surface/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <Avatar nom={compte.nom || compte.email} />
                    <div className="min-w-0">
                      <p className="truncate font-display text-[16px] text-ink">{affichage}</p>
                      {compte.nom && compte.email ? (
                        <a
                          href={`mailto:${compte.email}`}
                          className="block truncate text-[13px] text-accent-blue hover:underline"
                        >
                          {compte.email}
                        </a>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Pastille icone={statut?.icone} ton={statut?.ton ?? "gris"}>
                          {statut?.libelle ?? compte.statut.replace("_", " ")}
                        </Pastille>
                        <Pastille icone={role?.icone ?? UserCog} ton={role?.ton ?? "gris"}>
                          {role?.libelle ?? compte.role}
                        </Pastille>
                      </div>

                      {compte.role === "editeur" ? (
                        <div className="mt-2">
                          <p className="text-[12px] font-semibold text-muted-ink">
                            Droits de l'éditeur
                          </p>
                          {compte.droits && compte.droits.length > 0 ? (
                            <ul className="mt-1 flex flex-wrap gap-1.5">
                              {compte.droits.map((d) => (
                                <li key={d}>
                                  <Pastille ton="accent">{libelleDroit(d)}</Pastille>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-[12px] text-muted-ink">Aucun droit attribué</p>
                          )}
                          <p className="mt-1 text-[12px] text-muted-ink">
                            <Link
                              href="/admin/membres?entite=bureau"
                              className="font-semibold text-accent-blue hover:underline"
                            >
                              Gérer depuis Bureau et membres
                            </Link>
                          </p>
                        </div>
                      ) : null}

                      <p className="mt-2 text-[13px] text-ink-soft">
                        {compte.filiere_nom ?? "Filière non renseignée"}
                      </p>
                      <p className="mt-1 text-[12px] text-muted-ink">
                        Inscrit le {formatDate(compte.created_at.slice(0, 10))}
                        {compte.valide_le
                          ? `, traité le ${formatDate(compte.valide_le.slice(0, 10))}`
                          : null}
                      </p>
                      {compte.refus_motif ? (
                        <p className="mt-2 max-w-[60ch] rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-900">
                          Motif du refus : {compte.refus_motif}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    {compte.statut === "en_attente" ? (
                      <>
                        <BoutonAction
                          variante="principal"
                          icone={<UserCheck />}
                          action={validerCompte.bind(null, compte.user_id)}
                        >
                          Valider
                        </BoutonAction>
                        <BoutonMotif
                          libelle="Refuser"
                          titre="Refuser cette inscription"
                          aide="Le motif sera envoyé par e-mail à la personne concernée."
                          motifsFrequents={MOTIFS_REFUS_COMPTE}
                          action={refuserCompte.bind(null, compte.user_id)}
                        />
                      </>
                    ) : null}

                    {compte.statut === "valide" ? (
                      <>
                        {compte.role === "etudiant" ? (
                          <BoutonAction
                            icone={<Compass />}
                            confirmation="Promouvoir cette personne mentor ? Elle pourra être associée à des étudiants."
                            action={changerRole.bind(null, compte.user_id, "mentor")}
                          >
                            Promouvoir mentor
                          </BoutonAction>
                        ) : null}
                        <BoutonAction
                          variante="danger"
                          icone={<Ban />}
                          confirmation="Suspendre ce compte ? La personne perdra l'accès à la plateforme."
                          action={changerStatutCompte.bind(null, compte.user_id, "suspendu")}
                        >
                          Suspendre
                        </BoutonAction>
                      </>
                    ) : null}

                    {compte.statut === "suspendu" ? (
                      <BoutonAction
                        variante="principal"
                        icone={<RotateCcw />}
                        confirmation="Rétablir ce compte ? La personne retrouvera l'accès à la plateforme."
                        action={changerStatutCompte.bind(null, compte.user_id, "valide")}
                      >
                        Rétablir
                      </BoutonAction>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {comptes.length >= TAILLE ? (
        <p className="text-[13px] text-muted-ink">
          Affichage limité aux {TAILLE} comptes les plus récents. Utilisez les filtres pour affiner.
        </p>
      ) : null}
    </div>
  );
}
