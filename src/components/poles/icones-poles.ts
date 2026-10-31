import {
  BrainCircuit,
  Building2,
  Cog,
  FlaskConical,
  HeartPulse,
  LineChart,
  type LucideIcon,
} from "lucide-react";

/**
 * Icônes des pôles : l'API stocke une clé, le composant Lucide (non
 * sérialisable) est retrouvé ici. Mêmes clés que sur la page d'accueil.
 */
export const ICONES_POLES: Record<string, LucideIcon> = {
  batiment: Building2,
  industriel: Cog,
  sante: HeartPulse,
  economie: LineChart,
  data: BrainCircuit,
  sciences: FlaskConical,
};

/** Clé inconnue ou absente : la fiole des sciences. */
export function iconePole(cle: string | null | undefined): LucideIcon {
  return (cle ? ICONES_POLES[cle] : undefined) ?? FlaskConical;
}
