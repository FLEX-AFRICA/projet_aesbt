"use client";

import { forwardRef } from "react";

import { LARGEURS_APERCU, type ModeApercu } from "./BarreEditeur";

/**
 * Aperçu : la vraie page dans une iframe de même origine.
 *
 * L'iframe charge d'abord `/api/brouillon/activer`, qui pose le cookie du mode
 * brouillon puis redirige vers `/apercu/<page>` : un seul chargement suffit,
 * le cookie est posé avant l'affichage de l'aperçu. Changer `cleChargement`
 * remonte l'iframe (rechargement forcé).
 */
export const ApercuIframe = forwardRef<
  HTMLIFrameElement,
  { page: string; mode: ModeApercu; cleChargement: number; titre: string }
>(function ApercuIframe({ page, mode, cleChargement, titre }, ref) {
  const suite = encodeURIComponent(`/apercu/${page}`);
  const src = `/api/brouillon/activer?page=${encodeURIComponent(page)}&suite=${suite}`;

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-frost p-0 sm:p-3">
      <iframe
        key={cleChargement}
        ref={ref}
        src={src}
        title={`Aperçu de la page ${titre}`}
        style={{ width: LARGEURS_APERCU[mode] }}
        className="h-full max-w-full border-0 bg-white shadow-md"
      />
    </div>
  );
});
