import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Régénération des pages à la demande du backend.
 *
 * L'administration publie un contenu, le backend appelle cette route, et
 * seule la page concernée est régénérée. C'est ce qui permet au site de
 * rester statique tout en étant à jour, sans redéploiement.
 */

export const runtime = "nodejs";

/** Comparaison à temps constant, pour ne rien révéler par la durée. */
function secretValide(fourni: string | null, attendu: string): boolean {
  if (!fourni || fourni.length !== attendu.length) return false;

  let difference = 0;
  for (let i = 0; i < fourni.length; i += 1) {
    difference |= fourni.charCodeAt(i) ^ attendu.charCodeAt(i);
  }
  return difference === 0;
}

export async function POST(request: NextRequest) {
  const attendu = process.env.REVALIDATE_SECRET;

  // Sans secret configuré, la route reste fermée : une régénération ouverte
  // à tous serait un moyen simple d'épuiser le quota Vercel.
  if (!attendu) {
    return NextResponse.json({ erreur: "revalidation_desactivee" }, { status: 503 });
  }

  if (!secretValide(request.headers.get("x-revalidate-secret"), attendu)) {
    return NextResponse.json({ erreur: "non_autorise" }, { status: 401 });
  }

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "corps_invalide" }, { status: 400 });
  }

  const chemins = (corps as { chemins?: unknown })?.chemins;

  if (!Array.isArray(chemins) || chemins.length === 0 || chemins.length > 50) {
    return NextResponse.json({ erreur: "chemins_invalides" }, { status: 400 });
  }

  const valides = chemins.filter(
    (c): c is string => typeof c === "string" && c.startsWith("/") && c.length < 300,
  );

  for (const chemin of valides) {
    revalidatePath(chemin);
  }

  return NextResponse.json({ revalides: valides });
}
