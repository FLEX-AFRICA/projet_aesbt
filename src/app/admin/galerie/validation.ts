import { z } from "zod";

/** Schéma aligné sur `albumEntree` du backend (admin-contenus.ts). */
export const schemaAlbum = z.object({
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit faire au moins 3 caractères.")
    .max(200, "Le titre ne peut pas dépasser 200 caractères."),
  description: z.string().trim().max(2000, "La description ne peut pas dépasser 2000 caractères."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date."),
});
