"use server";

import { revalidatePath } from "next/cache";

import { appelApi, ApiErreur } from "@/lib/api-admin";

import type { Resultat } from "../actions";

/** Actions de nomination et de gestion des droits d'un éditeur (depuis Bureau et membres). */

function droitsValides(droits: unknown): droits is string[] {
  return (
    Array.isArray(droits) &&
    droits.length > 0 &&
    droits.every((d) => typeof d === "string" && d.length > 0)
  );
}

function messageApi(err: ApiErreur): string {
  if (err.code === "pas_membre_bureau") {
    return "Ce compte n'est pas membre actif du bureau. Rattachez-le d'abord au bureau, puis réessayez.";
  }
  if (err.code === "droits_invalides") {
    return "Au moins un droit valide doit être sélectionné.";
  }
  return err.message;
}

async function executer(action: () => Promise<unknown>): Promise<Resultat> {
  try {
    await action();
    revalidatePath("/admin/membres");
    revalidatePath("/admin/comptes");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiErreur) {
      return { ok: false, message: messageApi(err) };
    }
    return { ok: false, message: "Opération impossible. Réessayez." };
  }
}

export async function nommerEditeur(userId: string, droits: string[]): Promise<Resultat> {
  if (!droitsValides(droits)) {
    return { ok: false, message: "Sélectionnez au moins un droit." };
  }
  return executer(() =>
    appelApi(`/api/v1/admin/comptes/${encodeURIComponent(userId)}/role`, {
      methode: "POST",
      corps: { role: "editeur", droits },
    }),
  );
}

export async function modifierDroitsEditeur(userId: string, droits: string[]): Promise<Resultat> {
  if (!droitsValides(droits)) {
    return { ok: false, message: "Sélectionnez au moins un droit." };
  }
  return executer(() =>
    appelApi(`/api/v1/admin/comptes/${encodeURIComponent(userId)}/droits`, {
      methode: "PUT",
      corps: { droits },
    }),
  );
}

export async function retirerRoleEditeur(userId: string): Promise<Resultat> {
  return executer(() =>
    appelApi(`/api/v1/admin/comptes/${encodeURIComponent(userId)}/role`, {
      methode: "POST",
      corps: { role: "etudiant" },
    }),
  );
}
