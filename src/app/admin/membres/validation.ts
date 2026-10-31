import { z } from "zod";

/** Schéma aligné sur `membreEntree` du backend, appliqué aux valeurs de formulaire. */
export const schemaMembre = z.object({
  entite: z.enum(["bureau", "cellule"], "Choisissez une entité."),
  nom: z.string().trim().max(160, "Le nom ne peut pas dépasser 160 caractères."),
  role: z
    .string()
    .trim()
    .min(2, "Le rôle doit faire au moins 2 caractères.")
    .max(120, "Le rôle ne peut pas dépasser 120 caractères."),
  mandat_debut: z.string().trim().max(20, "20 caractères au plus."),
  mandat_fin: z.string().trim().max(20, "20 caractères au plus."),
});
