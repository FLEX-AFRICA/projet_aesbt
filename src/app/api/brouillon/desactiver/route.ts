import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { cheminInterne } from "@/lib/chemin-interne";
import { origineAutorisee } from "@/lib/origine-requete";

/**
 * Désactive le mode brouillon et redirige vers un chemin interne (`suite`,
 * sinon l'accueil). Aucune session requise : se déconnecter du mode brouillon
 * ne donne aucun droit. Jamais mise en cache.
 */
export const dynamic = "force-dynamic";

const SANS_CACHE = { "cache-control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  if (!origineAutorisee(request.headers.get("sec-fetch-site"))) {
    return NextResponse.json({ erreur: "origine_interdite" }, { status: 403, headers: SANS_CACHE });
  }

  (await draftMode()).disable();

  const suite = cheminInterne(request.nextUrl.searchParams.get("suite"), "/");
  const reponse = NextResponse.redirect(new URL(suite, request.nextUrl.origin));
  reponse.headers.set("cache-control", "no-store, max-age=0");
  return reponse;
}
