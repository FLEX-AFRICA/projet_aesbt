"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { actionButtonClass } from "@/components/ui-aesbt/ActionButton";

export type StatusVariant = "success" | "error" | "warning" | "info";

/** Couleurs de chaque variante : pastille, halo et anneau de l'icône. */
const VARIANTS: Record<
  StatusVariant,
  { icon: ComponentType<{ className?: string; strokeWidth?: number }>; text: string; tint: string }
> = {
  success: { icon: CheckCircle2, text: "text-accent-green", tint: "bg-accent-green" },
  error: { icon: XCircle, text: "text-accent-red", tint: "bg-accent-red" },
  warning: { icon: AlertTriangle, text: "text-[#C9961B]", tint: "bg-[#C9961B]" },
  info: { icon: Info, text: "text-ink", tint: "bg-ink" },
};

type Action = {
  label: string;
  /** Appelée au clic ; la popup se ferme ensuite, sauf si `keepOpen` est vrai. */
  onClick?: () => void;
  keepOpen?: boolean;
};

/**
 * Popup de retour d'action (succès, échec, avertissement, information),
 * réutilisable partout : envoi d'un formulaire, enregistrement, erreur réseau.
 *
 * ```tsx
 * <StatusDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   variant="success"
 *   title="Message envoyé"
 *   description="Nous vous répondrons bientôt."
 * />
 * ```
 *
 * Sans `action`, un seul bouton « Fermer » est affiché. `secondaryAction`
 * ajoute un bouton discret à côté (« Annuler », « Voir mes messages »...).
 */
export function StatusDialog({
  open,
  onOpenChange,
  variant,
  title,
  description,
  children,
  action,
  secondaryAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: StatusVariant;
  title: string;
  description?: ReactNode;
  /** Contenu libre sous la description (détails, référence, liste...). */
  children?: ReactNode;
  action?: Action;
  secondaryAction?: Action;
}) {
  const reduce = useReducedMotion();
  const { icon: Icon, text, tint } = VARIANTS[variant];

  const run = (a: Action) => () => {
    a.onClick?.();
    if (!a.keepOpen) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] gap-0 overflow-hidden rounded-3xl border-line/60 bg-surface p-8 text-center shadow-2xl sm:rounded-3xl">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-15 blur-[70px] ${tint}`}
        />

        <motion.div
          className="relative mx-auto grid size-20 place-items-center"
          initial={reduce ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          <span aria-hidden="true" className={`absolute inset-0 rounded-full opacity-10 ${tint}`} />
          {reduce ? null : (
            <motion.span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full ${tint}`}
              initial={{ scale: 1, opacity: 0.25 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut", repeat: 1 }}
            />
          )}
          <Icon className={`relative size-10 ${text}`} strokeWidth={1.8} />
        </motion.div>

        <DialogTitle className="relative mt-6 font-display text-xl font-semibold leading-tight tracking-tight text-ink">
          {title}
        </DialogTitle>
        {description ? (
          <DialogDescription className="relative mt-2 text-[15px] leading-relaxed text-muted-ink">
            {description}
          </DialogDescription>
        ) : null}
        {children ? <div className="relative mt-4 text-[14px] text-ink">{children}</div> : null}

        <div className="relative mt-7 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:justify-center">
          {secondaryAction ? (
            <button
              type="button"
              onClick={run(secondaryAction)}
              className={actionButtonClass("secondary")}
            >
              {secondaryAction.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={run(action ?? { label: "Fermer" })}
            className={actionButtonClass(variant === "error" ? "dark" : "primary")}
          >
            {action?.label ?? "Fermer"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
