import { z } from "zod";

/** Schéma aligné sur la création d'un pôle côté API (nom de 2 à 120 caractères). */
export const schemaPole = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit faire au moins 2 caractères.")
    .max(120, "Le nom ne peut pas dépasser 120 caractères."),
  ordre: z
    .string()
    .trim()
    .regex(/^\d{0,3}$/, "L'ordre est un nombre entier entre 0 et 999."),
});
