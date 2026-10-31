import { BookOpen, GraduationCap, School, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { appelApi } from "@/lib/api-admin";

import { Badge, classeCarte, EnTetePage, EtatVide } from "../_ui";
import { FormulaireDemande } from "./FormulaireDemande";

export const metadata = { title: "Trouver un mentor" };

interface Mentor {
  user_id: string;
  nom: string;
  niveau_id: string | null;
  bio: string | null;
  centres_interet: string | null;
  presentation: string | null;
  capacite_max: number;
  filiere_nom: string | null;
  filiere_slug: string | null;
  universite_nom: string | null;
  mentores_actifs: number;
  places_restantes: number;
}

interface Filiere {
  id: string;
  nom: string;
  slug: string;
}

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m.charAt(0).toUpperCase())
    .join("");
}

const classePastille =
  "rounded-full border border-line px-4 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-frost-deep/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue aria-[current=page]:border-accent-blue aria-[current=page]:bg-accent-blue aria-[current=page]:text-primary-foreground";

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ filiere?: string }>;
}) {
  const { filiere } = await searchParams;

  const [{ mentors }, { filieres }] = await Promise.all([
    appelApi<{ mentors: Mentor[] }>(
      `/api/v1/mentors${filiere ? `?filiere=${encodeURIComponent(filiere)}` : ""}`,
    ),
    appelApi<{ filieres: Filiere[] }>("/api/v1/filieres"),
  ]);

  return (
    <div className="space-y-6">
      <EnTetePage
        icone={Users}
        titre="Trouver un mentor"
        texte={
          <>
            Choisissez un mentor et présentez-vous.{" "}
            <strong className="font-semibold text-ink-soft">
              Ses coordonnées ne vous seront communiquées que s'il accepte
            </strong>
            , et uniquement tant que l'accompagnement dure.
          </>
        }
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par filière">
        <Link
          href="/cellule/mentors"
          aria-current={!filiere ? "page" : undefined}
          className={classePastille}
        >
          Toutes les filières
        </Link>
        {filieres.map((f) => (
          <Link
            key={f.id}
            href={`/cellule/mentors?filiere=${f.slug}`}
            aria-current={filiere === f.slug ? "page" : undefined}
            className={classePastille}
          >
            {f.nom}
          </Link>
        ))}
      </nav>

      {mentors.length === 0 ? (
        <EtatVide
          icone={Search}
          titre={
            filiere
              ? "Aucun mentor disponible dans cette filière"
              : "Aucun mentor disponible pour le moment"
          }
          texte={
            filiere
              ? "Essayez une autre filière, ou revenez plus tard : de nouveaux mentors rejoignent régulièrement la Cellule."
              : "Revenez plus tard : de nouveaux mentors rejoignent régulièrement la Cellule."
          }
          action={
            filiere ? (
              <Link
                href="/cellule/mentors"
                className="text-[13px] font-semibold text-accent-blue hover:underline"
              >
                Voir toutes les filières
              </Link>
            ) : null
          }
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {mentors.map((mentor) => (
            <li key={mentor.user_id} className={`${classeCarte} flex flex-col`}>
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 font-display text-[16px] font-medium text-accent-blue"
                >
                  {initiales(mentor.nom)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-display text-[18px] leading-snug text-ink">{mentor.nom}</h2>
                    {mentor.places_restantes > 0 ? (
                      <Badge ton="succes">
                        {mentor.places_restantes} place{mentor.places_restantes > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge ton="neutre">Complet</Badge>
                    )}
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-ink">
                    {mentor.filiere_nom ? (
                      <li className="inline-flex items-center gap-1.5">
                        <BookOpen aria-hidden="true" className="size-3.5" />
                        {mentor.filiere_nom}
                      </li>
                    ) : null}
                    {mentor.niveau_id ? (
                      <li className="inline-flex items-center gap-1.5">
                        <GraduationCap aria-hidden="true" className="size-3.5" />
                        {mentor.niveau_id}
                      </li>
                    ) : null}
                    {mentor.universite_nom ? (
                      <li className="inline-flex items-center gap-1.5">
                        <School aria-hidden="true" className="size-3.5" />
                        {mentor.universite_nom}
                      </li>
                    ) : null}
                    {!mentor.filiere_nom && !mentor.niveau_id && !mentor.universite_nom ? (
                      <li>Filière non renseignée</li>
                    ) : null}
                  </ul>
                </div>
              </div>

              {mentor.presentation ? (
                <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
                  {mentor.presentation}
                </p>
              ) : null}

              {mentor.centres_interet ? (
                <p className="mt-3 flex items-start gap-1.5 text-[13px] text-muted-ink">
                  <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <span className="font-medium text-ink-soft">Centres d'intérêt :</span>{" "}
                    {mentor.centres_interet}
                  </span>
                </p>
              ) : null}

              <div className="mt-5 border-t border-line pt-4">
                <FormulaireDemande
                  mentorId={mentor.user_id}
                  nomMentor={mentor.nom}
                  placesRestantes={mentor.places_restantes}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
