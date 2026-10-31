"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { televerserMedia } from "../actions";

/**
 * Ajout d'un média.
 *
 * Le texte alternatif est demandé **avant** l'envoi, et non après : une fois
 * l'image en ligne, personne ne revient le renseigner.
 */
export function Televersement() {
  const router = useRouter();
  const formulaire = useRef<HTMLFormElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [nom, setNom] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <form
      ref={formulaire}
      className="rounded-xl border border-line bg-surface/60 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);

        demarrer(async () => {
          setMessage(null);
          const resultat = await televerserMedia(donnees);

          if (resultat.ok) {
            setMessage({ ton: "ok", texte: "Image ajoutée." });
            formulaire.current?.reset();
            if (apercu) URL.revokeObjectURL(apercu);
            setApercu(null);
            setNom(null);
            router.refresh();
          } else {
            setMessage({ ton: "erreur", texte: resultat.message ?? "Téléversement refusé." });
          }
        });
      }}
    >
      <h2 className="font-display text-[16px] text-ink">Ajouter une image</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-ink">
        JPEG, PNG, WebP, AVIF ou HEIC, 12 Mo maximum. L'image est convertie en trois tailles et ses
        métadonnées sont supprimées, coordonnées GPS comprises.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
        <label className="grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-line bg-frost text-center">
          {apercu ? (
            <img src={apercu} alt="" className="size-full object-cover" />
          ) : (
            <span className="px-3 text-[12px] text-muted-ink">Choisir un fichier</span>
          )}
          <input
            type="file"
            name="fichier"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
            required
            className="sr-only"
            onChange={(e) => {
              const fichier = e.target.files?.[0];
              if (apercu) URL.revokeObjectURL(apercu);
              setApercu(fichier ? URL.createObjectURL(fichier) : null);
              setNom(fichier?.name ?? null);
            }}
          />
        </label>

        <div className="grid content-start gap-3">
          {nom ? <p className="truncate text-[12px] text-muted-ink">{nom}</p> : null}

          <label className="grid gap-2">
            <span className="text-[13px] font-medium text-ink">
              Texte alternatif <span className="text-muted-ink">(obligatoire)</span>
            </span>
            <input
              name="alt"
              required
              minLength={3}
              maxLength={300}
              placeholder="Les membres du bureau lors de l'assemblée générale"
              className="rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
            />
            <span className="text-[12px] text-muted-ink">
              Décrivez ce que montre l'image : c'est ce que lisent les personnes malvoyantes, et ce
              qui s'affiche si l'image ne charge pas.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={enCours}
              className="rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {enCours ? "Envoi…" : "Ajouter"}
            </button>

            {message ? (
              <p
                role="alert"
                className={`text-[13px] ${
                  message.ton === "ok" ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {message.texte}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
