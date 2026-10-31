import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "dark";

const BASE =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent-blue text-primary-foreground hover:bg-ink",
  secondary: "bg-surface/60 text-ink ring-1 ring-line hover:bg-surface",
  dark: "bg-ink text-primary-foreground hover:bg-accent-blue",
};

export function actionButtonClass(variant: Variant = "primary", className?: string) {
  return cn(BASE, VARIANTS[variant], className);
}

/** Bouton d'action pour une navigation interne. */
export function ActionLink({
  to,
  variant = "primary",
  className,
  children,
}: {
  to: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={to as any} className={actionButtonClass(variant, className)}>
      {children}
    </Link>
  );
}

/** Bouton d'action classique (formulaires, actions). */
export function ActionButton({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button className={actionButtonClass(variant, className)} {...props}>
      {children}
    </button>
  );
}
