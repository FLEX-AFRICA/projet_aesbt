import { NextResponse, type NextRequest } from "next/server";

/**
 * Transmet le chemin demandé aux layouts de l'administration (en-tête
 * `x-pathname`), car un layout n'a pas accès à l'URL. Sert à restreindre
 * le rôle éditeur à /admin/editeur/**. L'en-tête est toujours réécrit ici :
 * une valeur envoyée par le client est écrasée.
 */
export function proxy(request: NextRequest) {
  const entetes = new Headers(request.headers);
  entetes.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: entetes } });
}

export const config = { matcher: ["/admin/:path*"] };
