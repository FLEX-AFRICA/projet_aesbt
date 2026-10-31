import {
  Atom,
  Bell,
  BadgeCheck,
  Briefcase,
  CircleX,
  PenLine,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";

/** Icône par type de notification. */
const ICONES_TYPE: Record<string, LucideIcon> = {
  bureau_ajout: Briefcase,
  bureau_retrait: UserMinus,
  bureau_modification: Briefcase,
  pole_ajout: Atom,
  pole_retrait: UserMinus,
  pole_demande_recue: UserPlus,
  pole_demande_validee: UserCheck,
  pole_demande_refusee: UserX,
  editeur_nomme: PenLine,
  editeur_retire: ShieldOff,
  editeur_droits_modifies: ShieldCheck,
  inscription_validee: BadgeCheck,
  inscription_refusee: CircleX,
};

export function IconeNotification({ type, className }: { type: string; className?: string }) {
  const Icone = ICONES_TYPE[type] ?? Bell;
  return <Icone aria-hidden="true" className={className} />;
}

/** Date relative en français (« il y a 3 heures »), repli sur la date complète au-delà d'un mois. */
export function dateRelative(iso: string, maintenant: number = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const secondes = Math.round((t - maintenant) / 1000);
  const abs = Math.abs(secondes);
  const fmt = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return fmt.format(Math.round(secondes / 60), "minute");
  if (abs < 86400) return fmt.format(Math.round(secondes / 3600), "hour");
  if (abs < 86400 * 30) return fmt.format(Math.round(secondes / 86400), "day");
  return new Date(t).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** N'accepte que les chemins internes du site. */
export function lienInterne(lien: string | null): string | null {
  return lien && lien.startsWith("/") && !lien.startsWith("//") ? lien : null;
}

/** Événement émis après une action sur les notifications, pour que la cloche se rafraîchisse. */
export const EVENEMENT_NOTIFS = "aesbt:notifications-maj";
