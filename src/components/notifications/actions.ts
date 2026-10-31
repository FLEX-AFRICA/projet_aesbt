"use server";

import { revalidatePath } from "next/cache";

import {
  lireCompteurNotifications,
  lireNotifications,
  marquerNotificationLue,
  marquerToutesLues,
  supprimerNotification,
  type PageNotifications,
} from "@/lib/api-poles";
import { ApiErreur } from "@/lib/api-admin";

/**
 * Actions serveur de la cloche et des pages de notifications.
 * Le cookie de session est lu côté serveur ; aucune ne lève d'exception vers le client.
 */

export interface ResultatNotif {
  ok: boolean;
  message?: string;
}

const PAGES = ["/cellule/notifications", "/admin/notifications"];

function rafraichir() {
  for (const p of PAGES) revalidatePath(p);
}

function echec(err: unknown): ResultatNotif {
  return {
    ok: false,
    message: err instanceof ApiErreur ? err.message : "Opération impossible. Réessayez.",
  };
}

/** Nombre de notifications non lues, ou null si l'API est injoignable. */
export async function compteurNonLues(): Promise<number | null> {
  try {
    return await lireCompteurNotifications();
  } catch {
    return null;
  }
}

/** Dernières notifications pour le panneau de la cloche, ou null en cas d'échec. */
export async function dernieresNotifications(): Promise<PageNotifications | null> {
  try {
    return await lireNotifications(1, 8, false);
  } catch {
    return null;
  }
}

export async function marquerLue(id: string): Promise<ResultatNotif> {
  try {
    await marquerNotificationLue(id);
    rafraichir();
    return { ok: true };
  } catch (err) {
    return echec(err);
  }
}

export async function toutMarquerLu(): Promise<ResultatNotif> {
  try {
    await marquerToutesLues();
    rafraichir();
    return { ok: true };
  } catch (err) {
    return echec(err);
  }
}

export async function supprimerNotif(id: string): Promise<ResultatNotif> {
  try {
    await supprimerNotification(id);
    rafraichir();
    return { ok: true };
  } catch (err) {
    return echec(err);
  }
}
