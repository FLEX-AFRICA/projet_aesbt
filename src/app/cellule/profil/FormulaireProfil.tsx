"use client";

import {
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Phone,
  Save,
  TriangleAlert,
} from "lucide-react";
import { useId, useState, useTransition, type ReactNode } from "react";

import {
  ajouterFiliere,
  ajouterNiveau,
  ajouterUniversite,
} from "@/components/referentiels/actions";
import { SelectAvecAjout } from "@/components/referentiels/SelectAvecAjout";

import { enregistrerProfil, enregistrerReglagesMentor } from "../actions";

export interface ProfilInitial {
  filiere_id: string;
  universite_id: string;
  niveau_id: string;
  annee_arrivee: string;
  bio: string;
  centres_interet: string;
  telephone: string;
  whatsapp: string;
}

export interface MentorInitial {
  presentation: string;
  capacite_max: number;
  disponible: boolean;
}

const champ =
  "rounded-md border border-line bg-frost px-3 py-2 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40";

/** Section du profil : carte avec pastille d'icône et titre. */
function Section({
  icone: Icone,
  titre,
  aide,
  children,
}: {
  icone: typeof GraduationCap;
  titre: string;
  aide?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue"
        >
          <Icone className="size-[18px]" />
        </span>
        <h2 className="font-display text-lg tracking-tight text-ink">{titre}</h2>
      </div>
      {aide ? <p className="mt-3 text-[13px] leading-relaxed text-muted-ink">{aide}</p> : null}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

export function FormulaireProfil({
  initial,
  mentorInitial,
  estMentor,
  filieres,
  universites,
  niveaux,
}: {
  initial: ProfilInitial;
  mentorInitial: MentorInitial | null;
  estMentor: boolean;
  filieres: { id: string; nom: string; slug?: string }[];
  universites: { id: string; nom: string }[];
  niveaux: { id: string; libelle: string }[];
}) {
  const idFiliere = useId();
  const idNiveau = useId();
  const idUniversite = useId();
  const [v, setV] = useState(initial);
  const [m, setM] = useState<MentorInitial>(
    mentorInitial ?? { presentation: "", capacite_max: 3, disponible: true },
  );
  const [retour, setRetour] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <form
      className="mt-8 grid items-start gap-6 lg:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setRetour(null);

        demarrer(async () => {
          const profil = await enregistrerProfil({
            filiere_id: v.filiere_id || null,
            universite_id: v.universite_id || null,
            niveau_id: v.niveau_id || null,
            annee_arrivee: v.annee_arrivee ? Number(v.annee_arrivee) : null,
            bio: v.bio.trim() || null,
            centres_interet: v.centres_interet.trim() || null,
            telephone: v.telephone.trim() || null,
            whatsapp: v.whatsapp.trim() || null,
          });

          if (!profil.ok) {
            setRetour({ ton: "erreur", texte: profil.message ?? "Enregistrement impossible." });
            return;
          }

          if (estMentor) {
            const reglages = await enregistrerReglagesMentor({
              presentation: m.presentation.trim() || null,
              capacite_max: m.capacite_max,
              disponible: m.disponible,
            });

            if (!reglages.ok) {
              setRetour({
                ton: "erreur",
                texte: reglages.message ?? "Réglages de mentorat non enregistrés.",
              });
              return;
            }
          }

          setRetour({ ton: "ok", texte: "Profil enregistré." });
        });
      }}
    >
      <Section icone={GraduationCap} titre="Mon cursus">
        <div className="grid gap-2">
          <label htmlFor={idFiliere} className="text-[13px] font-medium text-ink">
            Filière
          </label>
          <SelectAvecAjout
            id={idFiliere}
            value={v.filiere_id}
            onChange={(filiere_id) => setV({ ...v, filiere_id })}
            options={filieres.map((f) => ({
              valeur: f.id,
              libelle: f.nom,
              technique: f.slug === "autre",
            }))}
            libelleVide="Non renseignée"
            libelleSaisie="Nom de votre filière"
            creer={ajouterFiliere}
            disabled={enCours}
            className="text-[15px]"
          />
          <span className="text-[12px] text-muted-ink">
            C'est elle qui détermine les mentors qui vous sont proposés.
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid content-start gap-2">
            <label htmlFor={idNiveau} className="text-[13px] font-medium text-ink">
              Niveau
            </label>
            <SelectAvecAjout
              id={idNiveau}
              value={v.niveau_id}
              onChange={(niveau_id) => setV({ ...v, niveau_id })}
              options={niveaux.map((n) => ({
                valeur: n.id,
                libelle: n.libelle,
                technique: n.id === "AUTRE",
              }))}
              libelleVide="Non renseigné"
              libelleSaisie="Votre niveau ou cursus"
              creer={ajouterNiveau}
              maxLength={40}
              disabled={enCours}
              className="text-[15px]"
            />
          </div>

          <label className="grid gap-2">
            <span className="text-[13px] font-medium text-ink">Arrivée en Tunisie</span>
            <input
              type="number"
              min={1960}
              max={2100}
              value={v.annee_arrivee}
              onChange={(e) => setV({ ...v, annee_arrivee: e.target.value })}
              placeholder="2026"
              className={champ}
            />
          </label>
        </div>

        <div className="grid gap-2">
          <label htmlFor={idUniversite} className="text-[13px] font-medium text-ink">
            Université
          </label>
          <SelectAvecAjout
            id={idUniversite}
            value={v.universite_id}
            onChange={(universite_id) => setV({ ...v, universite_id })}
            options={universites.map((u) => ({ valeur: u.id, libelle: u.nom }))}
            libelleVide="Non renseignée"
            libelleSaisie="Nom de votre université"
            creer={ajouterUniversite}
            maxLength={160}
            disabled={enCours}
            className="text-[15px]"
          />
        </div>

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Centres d'intérêt</span>
          <input
            value={v.centres_interet}
            onChange={(e) => setV({ ...v, centres_interet: e.target.value })}
            maxLength={500}
            placeholder="Recherche clinique, santé publique…"
            className={champ}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Quelques mots sur vous</span>
          <textarea
            value={v.bio}
            onChange={(e) => setV({ ...v, bio: e.target.value })}
            rows={4}
            maxLength={2000}
            className={champ}
          />
        </label>
      </Section>

      <div className="space-y-6">
        <Section
          icone={Phone}
          titre="Mes coordonnées"
          aide={
            <>
              Elles ne figurent <strong>jamais</strong> dans la liste publique des mentors. Elles ne
              sont communiquées qu'aux personnes avec qui vous avez un accompagnement en cours, et
              cessent de l'être dès qu'il prend fin.
            </>
          }
        >
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-[13px] font-medium text-ink">Téléphone</span>
              <input
                type="tel"
                value={v.telephone}
                onChange={(e) => setV({ ...v, telephone: e.target.value })}
                placeholder="+216 20 000 000"
                className={champ}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[13px] font-medium text-ink">WhatsApp</span>
              <input
                type="tel"
                value={v.whatsapp}
                onChange={(e) => setV({ ...v, whatsapp: e.target.value })}
                placeholder="+226 70 00 00 00"
                className={champ}
              />
            </label>
          </div>
        </Section>

        {estMentor ? (
          <Section icone={HeartHandshake} titre="Mentorat">
            <label className="grid gap-2">
              <span className="text-[13px] font-medium text-ink">Votre présentation</span>
              <textarea
                value={m.presentation}
                onChange={(e) => setM({ ...m, presentation: e.target.value })}
                rows={4}
                maxLength={2000}
                placeholder="Ce sur quoi vous pouvez aider, votre parcours, votre disponibilité."
                className={champ}
              />
              <span className="text-[12px] text-muted-ink">
                C'est ce que lisent les étudiants avant de vous solliciter.
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-[13px] font-medium text-ink">
                Nombre maximal d'étudiants accompagnés
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={m.capacite_max}
                onChange={(e) => setM({ ...m, capacite_max: Number(e.target.value) })}
                className={`${champ} max-w-[120px]`}
              />
              <span className="text-[12px] text-muted-ink">
                Au-delà, vous n'apparaissez plus comme disponible. Vous ne pouvez pas descendre en
                dessous du nombre d'étudiants que vous accompagnez déjà.
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={m.disponible}
                onChange={(e) => setM({ ...m, disponible: e.target.checked })}
                className="mt-1"
              />
              <span>
                <span className="text-[14px] font-medium text-ink">
                  J'accepte de nouvelles demandes
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-ink">
                  Décochez pour faire une pause sans perdre vos accompagnements en cours.
                </span>
              </span>
            </label>
          </Section>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={enCours}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save aria-hidden="true" className="size-4" />
            {enCours ? "Enregistrement…" : "Enregistrer"}
          </button>

          {retour ? (
            <p
              role="alert"
              className={`flex items-center gap-1.5 text-[13px] ${retour.ton === "ok" ? "text-emerald-700" : "text-red-700"}`}
            >
              {retour.ton === "ok" ? (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              ) : (
                <TriangleAlert aria-hidden="true" className="size-4" />
              )}
              {retour.texte}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
