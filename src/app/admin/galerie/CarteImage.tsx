"use client";

import { Check, CircleAlert, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import type { ImageBibliotheque } from "@/lib/api-admin-galerie";
import { formatDate } from "@/lib/format";

import { corrigerAlt, supprimerMedia } from "../actions";
import { Pastille } from "../_gestion/Pastille";

const MEDIA = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");

function poids(octets: number): string {
  return octets >= 1_048_576
    ? `${(octets / 1_048_576).toFixed(1)} Mo`
    : `${Math.round(octets / 1024)} Ko`;
}

/** Usage de l'image si l'API l'indique : `true`, `false`, ou `null` si inconnu. */
function estUtilisee(image: ImageBibliotheque): boolean | null {
  if (typeof image.nb_usages === "number") return image.nb_usages > 0;
  if (typeof image.utilise === "boolean") return image.utilise;
  return null;
}

/** Carte d'une image de la bibliothèque : aperçu, texte alternatif modifiable et suppression. */
export function CarteImage({ image }: { image: ImageBibliotheque }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [alt, setAlt] = useState(image.alt);
  const [confirmer, setConfirmer] = useState(false);
  const [erreur, setErreur] = useState<{ titre: string; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  const utilisee = estUtilisee(image);

  const enregistrerAlt = () =>
    demarrer(async () => {
      const r = await corrigerAlt(image.id, alt);
      if (r.ok) {
        setEdition(false);
        router.refresh();
      } else {
        setErreur({ titre: "Modification impossible", message: r.message ?? "Échec." });
      }
    });

  const supprimer = () =>
    demarrer(async () => {
      const r = await supprimerMedia(image.id);
      if (r.ok) router.refresh();
      else
        setErreur({
          titre: "Suppression impossible",
          message: r.message ?? "La suppression a échoué.",
        });
    });

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-surface/60">
      {MEDIA ? (
        <img
          src={`${MEDIA}/${image.chemin}-md.webp`}
          srcSet={`${MEDIA}/${image.chemin}-thumb.webp 400w, ${MEDIA}/${image.chemin}-md.webp 1200w`}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
          alt={image.alt}
          loading="lazy"
          className="aspect-[4/3] w-full bg-frost object-cover"
        />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-frost text-[12px] text-muted-ink">
          NEXT_PUBLIC_MEDIA_URL non renseignée
        </div>
      )}

      <div className="grid gap-3 p-4">
        {utilisee === null ? null : utilisee ? (
          <Pastille icone={Check} ton="vert" className="w-fit">
            Utilisée
          </Pastille>
        ) : (
          <Pastille icone={CircleAlert} ton="gris" className="w-fit">
            Non utilisée
          </Pastille>
        )}

        {edition ? (
          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-[12px] font-medium text-ink">Texte alternatif</span>
              <textarea
                value={alt}
                rows={3}
                minLength={3}
                maxLength={300}
                disabled={enCours}
                onChange={(e) => setAlt(e.target.value)}
                className="rounded-md border border-line bg-frost px-3 py-2 text-[13px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={enCours || alt.trim().length < 3}
                onClick={enregistrerAlt}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent-blue px-3 py-1.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Check aria-hidden="true" className="size-3.5" />
                Enregistrer
              </button>
              <button
                type="button"
                disabled={enCours}
                onClick={() => {
                  setAlt(image.alt);
                  setEdition(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface disabled:opacity-50"
              >
                <X aria-hidden="true" className="size-3.5" />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[13px] leading-snug text-ink">{image.alt}</p>
        )}

        <p className="text-[12px] text-muted-ink">
          {image.largeur && image.hauteur ? `${image.largeur} × ${image.hauteur}, ` : null}
          {poids(image.taille)}, {formatDate(image.created_at.slice(0, 10))}
          {image.uploade_par_nom ? `, ${image.uploade_par_nom}` : null}
        </p>

        <div className="flex flex-wrap gap-2">
          {edition ? null : (
            <button
              type="button"
              onClick={() => setEdition(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
              Texte alternatif
            </button>
          )}
          <button
            type="button"
            disabled={enCours}
            onClick={() => setConfirmer(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
            Supprimer
          </button>
        </div>
      </div>

      <StatusDialog
        open={confirmer}
        onOpenChange={setConfirmer}
        variant="warning"
        title="Supprimer cette image ?"
        description="L'image sera supprimée définitivement. Si elle est utilisée dans un contenu, la suppression sera refusée : retirez-la d'abord des contenus concernés."
        action={{ label: "Supprimer définitivement", onClick: supprimer }}
        secondaryAction={{ label: "Annuler" }}
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title={erreur?.titre ?? ""}
        description={erreur?.message}
      />
    </li>
  );
}
