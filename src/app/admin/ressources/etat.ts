import type { RessourceAdmin } from "./ListeRessources";

/** Lecture tolérante des champs récents : sans eux, un lien public d'origine admin. */
export const estCommunautaire = (r: RessourceAdmin) => r.origine === "communaute";
export const estFichier = (r: RessourceAdmin) => r.type === "document";
export const estPrivee = (r: RessourceAdmin) => estCommunautaire(r) || r.visibilite === "prive";
