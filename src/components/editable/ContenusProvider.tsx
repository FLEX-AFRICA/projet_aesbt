import type { ReactNode } from "react";

import { chargerContenusEtMedias, resoudreContenusPage } from "@/lib/contenus";
import { ContenusClient } from "./ContenusClient";

/**
 * Charge les contenus d'une page côté serveur et les expose aux `<Editable>`.
 *
 * Les clés de la page `commun` (bande d'adhésion, navigation, pied de page)
 * sont fusionnées avec celles de la page quand elle les utilise, et la table
 * des médias (identifiant vers chemin) accompagne les contenus.
 *
 * Deux modes, pour garder le site public statique :
 * - par défaut (`apercu` faux) : contenus publiés + défauts, SANS toucher à
 *   `draftMode()` ni aux cookies : la page reste statique (ISR) ;
 * - `apercu` : lit le mode brouillon et la session. Réservé aux routes
 *   /apercu/..., seules pages dynamiques.
 */
export async function ContenusProvider({
  page,
  apercu = false,
  children,
}: {
  page: string;
  apercu?: boolean;
  children: ReactNode;
}) {
  const { contenus, medias, modeEdition } = apercu
    ? await resoudreContenusPage(page)
    : { ...(await chargerContenusEtMedias(page)), modeEdition: false };

  return (
    <ContenusClient contenus={contenus} medias={medias} modeEdition={modeEdition} page={page}>
      {children}
    </ContenusClient>
  );
}
