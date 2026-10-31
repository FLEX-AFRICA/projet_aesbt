import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { peutEditerContenus, sessionCourante } from "@/lib/api-admin";
import { cheminInterne } from "@/lib/chemin-interne";
import { origineAutorisee } from "@/lib/origine-requete";

/**
 * Active le mode brouillon de Next pour la session courante.
 *
 * GET /api/brouillon/activer?page=association&suite=/apercu/association
 *
 * - Session absente : 401. Compte ni administrateur ni éditeur : 403.
 * - `suite` n'est suivie que si c'est un chemin interne (voir `cheminInterne`),
 *   pour qu'on ne puisse pas s'en servir comme redirection ouverte.
 * - Requête `Sec-Fetch-Site: cross-site` : 403 (voir `origineAutorisee`).
 * - Jamais mise en cache : la réponse dépend du cookie de session.
 */
export const dynamic = "force-dynamic";

const SANS_CACHE = { "cache-control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  if (!origineAutorisee(request.headers.get("sec-fetch-site"))) {
    return NextResponse.json({ erreur: "origine_interdite" }, { status: 403, headers: SANS_CACHE });
  }

  const session = await sessionCourante();
  if (!session) {
    return NextResponse.json({ erreur: "non_authentifie" }, { status: 401, headers: SANS_CACHE });
  }
  if (!peutEditerContenus(session)) {
    return NextResponse.json({ erreur: "interdit" }, { status: 403, headers: SANS_CACHE });
  }

  const params = request.nextUrl.searchParams;
  const page = params.get("page");
  const suite = cheminInterne(
    params.get("suite"),
    page && /^[a-z0-9_-]{1,60}$/.test(page) ? `/apercu/${page}` : "/",
  );

  (await draftMode()).enable();

  const reponse = NextResponse.redirect(new URL(suite, request.nextUrl.origin));
  reponse.headers.set("cache-control", "no-store, max-age=0");
  return reponse;
}
