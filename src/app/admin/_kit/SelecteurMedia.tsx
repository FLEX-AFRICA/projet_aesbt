"use client";

import { ImageIcon } from "lucide-react";
import { useId, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { MediaChoisissable } from "./types";

/**
 * Champ de choix d'un média de la galerie.
 *
 * La liste est fournie par l'appelant (côté serveur, via `mediasDisponibles()`
 * de publications/_medias.ts) : le composant reste indépendant de l'API.
 * Si `name` est fourni, l'identifiant choisi est aussi posté par un champ caché.
 */
export function SelecteurMedia({
  libelle,
  medias,
  valeur,
  onChange,
  aide,
  name,
  disabled = false,
  messageVide,
}: {
  libelle: string;
  medias: readonly MediaChoisissable[];
  /** Identifiant du média choisi, ou null. */
  valeur: string | null;
  onChange: (id: string | null) => void;
  aide?: string;
  name?: string;
  disabled?: boolean;
  /** Remplace le message affiché quand la liste est vide (ex. accès restreint). */
  messageVide?: string;
}) {
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [brouillon, setBrouillon] = useState<string | null>(valeur);

  const choisi = medias.find((m) => m.id === valeur) ?? null;

  const ouvrir = () => {
    setBrouillon(valeur);
    setOuvert(true);
  };

  return (
    <div className="grid gap-1.5">
      <span id={`${id}-libelle`} className="text-[13px] font-medium text-ink">
        {libelle}
      </span>
      {name ? <input type="hidden" name={name} value={valeur ?? ""} /> : null}

      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface/60 p-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-frost text-muted-ink">
          {choisi?.vignette ? (
            <img src={choisi.vignette} alt={choisi.alt} className="size-full object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" className="size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-ink">
            {choisi
              ? choisi.alt
              : valeur
                ? "Média introuvable dans la liste"
                : "Aucune image choisie"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={ouvrir}
              aria-labelledby={`${id}-libelle ${id}-choisir`}
              className="rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50"
            >
              <span id={`${id}-choisir`}>{valeur ? "Changer" : "Choisir une image"}</span>
            </button>
            {valeur ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(null)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Retirer
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {aide ? <p className="text-[12px] text-muted-ink">{aide}</p> : null}

      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-4 border-line bg-surface">
          <div>
            <DialogTitle className="font-display text-lg text-ink">Galerie</DialogTitle>
            <DialogDescription className="mt-1 text-[14px] text-muted-ink">
              Choisissez une image puis validez.
            </DialogDescription>
          </div>

          {medias.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-8 text-center text-[14px] text-muted-ink">
              {messageVide ?? "Aucune image dans la galerie. Ajoutez-en depuis la page Galerie."}
            </p>
          ) : (
            <ul
              aria-label="Images de la galerie"
              className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4"
            >
              {medias.map((m) => {
                const actif = brouillon === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      aria-pressed={actif}
                      onClick={() => setBrouillon(m.id)}
                      className={cn(
                        "block w-full overflow-hidden rounded-lg border bg-frost text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
                        actif
                          ? "border-accent-blue ring-2 ring-accent-blue"
                          : "border-line hover:shadow-md",
                      )}
                    >
                      {m.vignette ? (
                        <img
                          src={m.vignette}
                          alt=""
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <span className="grid aspect-[4/3] place-items-center text-[11px] text-muted-ink">
                          Pas d'aperçu
                        </span>
                      )}
                      <span className="block truncate px-2 py-1.5 text-[12px] text-ink">
                        {m.alt}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="rounded-md border border-line px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-frost"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!brouillon}
              onClick={() => {
                onChange(brouillon);
                setOuvert(false);
              }}
              className="rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Choisir cette image
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
