import { z } from "zod";

import { estUrlHttp } from "../_commun/validation";

/** Schéma aligné sur `evenementEntree` du backend, appliqué aux valeurs de formulaire. */
export const schemaEvenement = z.object({
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit faire au moins 3 caractères.")
    .max(200, "Le titre ne peut pas dépasser 200 caractères."),
  description: z.string().trim().max(5000, "La description ne peut pas dépasser 5000 caractères."),
  debute_le: z.string(),
  lieu: z.string().trim().max(200, "Le lieu ne peut pas dépasser 200 caractères."),
  inscription_url: z
    .string()
    .trim()
    .max(2000, "Le lien est trop long.")
    .refine((v) => v === "" || estUrlHttp(v), "Saisissez une adresse http ou https complète."),
  lien_photos: z
    .string()
    .trim()
    .max(2000, "Le lien est trop long.")
    .refine((v) => v === "" || estUrlHttp(v), "Saisissez une adresse http ou https complète."),
});
