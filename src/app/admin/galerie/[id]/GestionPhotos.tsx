"use client";

import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type DragEvent } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import type { AlbumDetail, PhotoDetail } from "@/lib/api-admin-galerie";
import { cn } from "@/lib/utils";

import { televerserMedia } from "../../actions";
import { classeBoutonPrincipal, type MediaChoisissable } from "../../_kit";
import { ChampCouverture } from "../../_commun/ChampCouverture";
import { Vignette } from "../../_commun/Vignette";
import { enregistrerPhotosAlbum, modifierAlbum } from "../actions";

const MAX_PHOTOS = 300;
const MAX_LEGENDE = 300;
const MAX_OCTETS = 12 * 1024 * 1024;
const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"];

interface LignePhoto {
  media_id: string;
  chemin: string | null;
  /** Aperçu local d'une photo tout juste téléversée. */
  apercu: string | null;
  alt: string;
  legende: string;
}

/** Texte alternatif provisoire d'une photo téléversée dans l'album (modifiable dans « Toutes les images »). */
function altProvisoire(titreAlbum: string, numero: number): string {
  return `${titreAlbum}, photo ${numero}`.slice(0, 300);
}

/**
 * Photos d'un album : ajout par glisser-déposer ou sélecteur (téléversement
 * puis rattachement immédiats), ajout depuis la bibliothèque, légende, ordre,
 * couverture et retrait. L'ordre et les légendes s'enregistrent par un bouton.
 */
export function GestionPhotos({
  album,
  photosInitiales,
  medias,
}: {
  album: AlbumDetail;
  photosInitiales: PhotoDetail[];
  medias: MediaChoisissable[];
}) {
  const router = useRouter();
  const entree = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<LignePhoto[]>(() =>
    photosInitiales.map((p) => ({
      media_id: p.media_id,
      chemin: p.chemin,
      apercu: null,
      alt: p.alt,
      legende: p.legende ?? "",
    })),
  );
  const [couvertureId, setCouvertureId] = useState<string | null>(album.couverture_id);
  const [modifie, setModifie] = useState(false);
  const [survol, setSurvol] = useState(false);
  const [progression, setProgression] = useState<string | null>(null);
  const [avertissement, setAvertissement] = useState<{ titre: string; message: string } | null>(
    null,
  );
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  const occupe = enCours || progression !== null;

  const changer = (suivantes: LignePhoto[]) => {
    setPhotos(suivantes);
    setModifie(true);
  };

  const enregistrerListe = async (liste: LignePhoto[]) =>
    enregistrerPhotosAlbum(
      album.id,
      liste.map((p) => ({ media_id: p.media_id, legende: p.legende.trim() || null })),
    );

  const ajouterDepuisBibliotheque = (id: string | null) => {
    if (!id) return;
    const media = medias.find((m) => m.id === id);
    if (photos.some((p) => p.media_id === id)) {
      setAvertissement({
        titre: "Ajout impossible",
        message: "Cette image figure déjà dans l'album.",
      });
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      setAvertissement({
        titre: "Ajout impossible",
        message: `Un album ne peut pas dépasser ${MAX_PHOTOS} photos.`,
      });
      return;
    }
    changer([
      ...photos,
      { media_id: id, chemin: null, apercu: null, alt: media?.alt ?? "Image", legende: "" },
    ]);
  };

  /** Téléverse chaque fichier, puis rattache toutes les nouvelles photos à l'album en une fois. */
  const televerserFichiers = async (fichiers: File[]) => {
    const problemes: string[] = [];
    const valides = fichiers.filter((f) => {
      if (!TYPES_ACCEPTES.includes(f.type)) {
        problemes.push(`${f.name} : format non pris en charge.`);
        return false;
      }
      if (f.size > MAX_OCTETS) {
        problemes.push(`${f.name} : plus de 12 Mo.`);
        return false;
      }
      return true;
    });

    const place = MAX_PHOTOS - photos.length;
    const retenus = valides.slice(0, Math.max(place, 0));
    if (valides.length > retenus.length) {
      problemes.push(
        `Un album ne peut pas dépasser ${MAX_PHOTOS} photos : certains fichiers ignorés.`,
      );
    }

    const ajoutes: LignePhoto[] = [];
    for (const [i, fichier] of retenus.entries()) {
      setProgression(`Envoi de ${i + 1} sur ${retenus.length}...`);
      const formulaire = new FormData();
      formulaire.set("fichier", fichier, fichier.name);
      formulaire.set("alt", altProvisoire(album.titre, photos.length + ajoutes.length + 1));
      const r = await televerserMedia(formulaire);
      if (!r.ok || !r.id) {
        problemes.push(`${fichier.name} : ${r.message ?? "téléversement refusé."}`);
        continue;
      }
      const id = r.id;
      if (photos.some((p) => p.media_id === id) || ajoutes.some((p) => p.media_id === id)) {
        problemes.push(`${fichier.name} : déjà présente dans l'album.`);
        continue;
      }
      ajoutes.push({
        media_id: id,
        chemin: null,
        apercu: URL.createObjectURL(fichier),
        alt: altProvisoire(album.titre, photos.length + ajoutes.length + 1),
        legende: "",
      });
    }

    if (ajoutes.length > 0) {
      setProgression("Ajout à l'album...");
      const suivantes = [...photos, ...ajoutes];
      const r = await enregistrerListe(suivantes);
      if (r.ok) {
        setPhotos(suivantes);
        setModifie(false);
        router.refresh();
      } else {
        problemes.push(r.message ?? "Le rattachement à l'album a échoué.");
      }
    }
    setProgression(null);
    if (problemes.length > 0) {
      setAvertissement({
        titre: "Certaines photos n'ont pas été ajoutées",
        message: problemes.join("\n"),
      });
    }
  };

  const surDepot = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setSurvol(false);
    if (occupe) return;
    void televerserFichiers(Array.from(e.dataTransfer.files));
  };

  const deplacer = (index: number, sens: -1 | 1) => {
    const cible = index + sens;
    if (cible < 0 || cible >= photos.length) return;
    const copie = [...photos];
    [copie[index], copie[cible]] = [copie[cible]!, copie[index]!];
    changer(copie);
  };

  const enregistrer = () => {
    demarrer(async () => {
      const resultat = await enregistrerListe(photos);
      if (resultat.ok) {
        setModifie(false);
        setRetour({ ok: true, message: "Les photos de l'album ont été enregistrées." });
        router.refresh();
      } else {
        setRetour({ ok: false, message: resultat.message ?? "L'enregistrement a échoué." });
      }
    });
  };

  const definirCouverture = (mediaId: string) => {
    demarrer(async () => {
      const r = await modifierAlbum(album.id, {
        titre: album.titre,
        description: album.description,
        date: album.date,
        couverture_id: mediaId,
        evenement_id: album.evenement_id,
      });
      if (r.ok) {
        setCouvertureId(mediaId);
        router.refresh();
      } else {
        setAvertissement({
          titre: "Couverture non modifiée",
          message: r.message ?? "Le changement de couverture a échoué.",
        });
      }
    });
  };

  return (
    <section aria-labelledby="titre-photos" className="mt-8 grid gap-6">
      <h2 id="titre-photos" className="font-display text-lg tracking-tight text-ink">
        Photos ({photos.length})
      </h2>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={surDepot}
          className={cn(
            "grid place-items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            survol ? "border-accent-blue bg-accent-blue/5" : "border-line bg-surface/40",
          )}
        >
          <UploadCloud aria-hidden="true" className="size-7 text-muted-ink" />
          <p className="text-[14px] text-ink">Glissez des photos ici, ou</p>
          <button
            type="button"
            disabled={occupe}
            onClick={() => entree.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface disabled:opacity-50"
          >
            <ImagePlus aria-hidden="true" className="size-4" />
            Choisir des fichiers
          </button>
          <input
            ref={entree}
            type="file"
            multiple
            accept={TYPES_ACCEPTES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label="Ajouter des photos depuis votre appareil"
            onChange={(e) => {
              const fichiers = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (fichiers.length > 0) void televerserFichiers(fichiers);
            }}
          />
          <p className="text-[12px] text-muted-ink">
            JPEG, PNG, WebP, AVIF ou HEIC, 12 Mo maximum par photo. Elles sont ajoutées à l'album
            tout de suite. Précisez leur texte alternatif ensuite dans « Toutes les images ».
          </p>
          <p role="status" className="min-h-[1.25rem] text-[13px] font-medium text-accent-blue">
            {progression ?? ""}
          </p>
        </div>

        <ChampCouverture
          libelle="Choisir dans la bibliothèque"
          aide="Ajoute une image déjà téléversée, en fin d'album. Pensez ensuite à enregistrer."
          medias={medias}
          valeur={null}
          onChange={ajouterDepuisBibliotheque}
          disabled={occupe}
        />
      </div>

      {photos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface/50 p-8 text-center text-[15px] text-muted-ink">
          Cet album ne contient aucune photo.
        </p>
      ) : (
        <ol aria-label="Photos de l'album" className="grid gap-3">
          {photos.map((p, index) => {
            const idLegende = `legende-${p.media_id}`;
            const estCouverture = p.media_id === couvertureId;
            return (
              <li
                key={p.media_id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface/60 p-3"
              >
                <span className="w-6 text-center text-[13px] font-semibold text-muted-ink">
                  {index + 1}
                </span>
                <Vignette
                  chemin={p.chemin}
                  url={p.apercu ?? medias.find((m) => m.id === p.media_id)?.vignette ?? null}
                  className="size-20"
                />
                <div className="grid min-w-[12rem] flex-1 gap-1">
                  <label htmlFor={idLegende} className="text-[13px] font-medium text-ink">
                    Légende ({p.alt})
                  </label>
                  <input
                    id={idLegende}
                    value={p.legende}
                    maxLength={MAX_LEGENDE}
                    disabled={occupe}
                    onChange={(e) =>
                      changer(
                        photos.map((q) =>
                          q.media_id === p.media_id ? { ...q, legende: e.target.value } : q,
                        ),
                      )
                    }
                    className="w-full rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    aria-label={
                      estCouverture
                        ? `La photo ${index + 1} est la couverture`
                        : `Définir la photo ${index + 1} comme couverture`
                    }
                    aria-pressed={estCouverture}
                    title={estCouverture ? "Couverture de l'album" : "Définir comme couverture"}
                    disabled={occupe || estCouverture || modifie}
                    onClick={() => definirCouverture(p.media_id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-[12px] font-semibold disabled:opacity-60",
                      estCouverture
                        ? "border-[#C9961B]/50 bg-[#C9961B]/10 text-[#7a5a0a]"
                        : "border-line text-ink hover:bg-surface",
                    )}
                  >
                    <Star aria-hidden="true" className="size-4" />
                    {estCouverture ? "Couverture" : "Couverture ?"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Monter la photo ${index + 1}`}
                    disabled={occupe || index === 0}
                    onClick={() => deplacer(index, -1)}
                    className="rounded-md border border-line p-2 text-ink hover:bg-surface disabled:opacity-40"
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Descendre la photo ${index + 1}`}
                    disabled={occupe || index === photos.length - 1}
                    onClick={() => deplacer(index, 1)}
                    className="rounded-md border border-line p-2 text-ink hover:bg-surface disabled:opacity-40"
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Retirer la photo ${index + 1} de l'album`}
                    disabled={occupe}
                    onClick={() => changer(photos.filter((q) => q.media_id !== p.media_id))}
                    className="rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={occupe || !modifie}
          onClick={enregistrer}
          className={classeBoutonPrincipal}
        >
          {enCours ? "Enregistrement..." : "Enregistrer les photos"}
        </button>
        <p role="status" className="text-[13px] text-muted-ink">
          {modifie
            ? "Modifications non enregistrées. Enregistrez avant de changer la couverture."
            : ""}
        </p>
        <p className="text-[12px] text-muted-ink">
          Retirer une photo ne la supprime pas de la bibliothèque. L'enregistrement remplace
          l'ensemble des photos de l'album.
        </p>
      </div>

      <StatusDialog
        open={avertissement !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setAvertissement(null);
        }}
        variant="warning"
        title={avertissement?.titre ?? ""}
        description={avertissement?.message}
      />
      <StatusDialog
        open={retour !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setRetour(null);
        }}
        variant={retour?.ok ? "success" : "error"}
        title={retour?.ok ? "Photos enregistrées" : "Enregistrement impossible"}
        description={retour?.message}
      />
    </section>
  );
}
