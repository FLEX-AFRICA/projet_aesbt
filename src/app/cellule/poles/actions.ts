"use server";

import { revalidatePath } from "next/cache";

import { ApiErreur } from "@/lib/api-admin";
import { annulerDemandePole, demanderPole, quitterPole } from "@/lib/api-poles";

export interface ResultatPole {
  ok: boolean;
  message?: string;
}

const MESSAGES: Record<string, string> = {
  deja_membre: "Vous êtes déjà membre de ce pôle.",
  demande_existante: "Vous avez déjà une demande en attente pour ce pôle.",
  trop_de_demandes:
    "Vous avez atteint le nombre maximal de demandes en attente. Annulez-en une avant d'en faire une nouvelle.",
};

async function executer(id: string, action: () => Promise<unknown>): Promise<ResultatPole> {
  try {
    await action();
    revalidatePath("/cellule/poles");
    revalidatePath(`/cellule/poles/${id}`);
    revalidatePath("/cellule");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiErreur) {
      return { ok: false, message: MESSAGES[err.code] ?? err.message };
    }
    return { ok: false, message: "Opération impossible. Réessayez." };
  }
}

export async function demanderARejoindre(id: string, message: string): Promise<ResultatPole> {
  if (message.length > 1000) {
    return { ok: false, message: "Le message ne peut pas dépasser 1000 caractères." };
  }
  return executer(id, () => demanderPole(id, message));
}

export async function annulerMaDemande(id: string): Promise<ResultatPole> {
  return executer(id, () => annulerDemandePole(id));
}

export async function quitterLePole(id: string): Promise<ResultatPole> {
  return executer(id, () => quitterPole(id));
}
