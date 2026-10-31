import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** État vide réutilisable (listes sans contenu publié). */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="font-display text-xl text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-[48ch] text-sm leading-relaxed text-muted-ink">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/** État de chargement (squelettes sobres). */
export function LoadingState({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[16/10] w-full rounded-lg bg-frost-deep/70" />
          <div className="mt-4 h-3 w-24 rounded bg-frost-deep/70" />
          <div className="mt-3 h-4 w-3/4 rounded bg-frost-deep/70" />
          <div className="mt-2 h-3 w-full rounded bg-frost-deep/70" />
        </div>
      ))}
      <span className="sr-only">Chargement en cours</span>
    </div>
  );
}

/** État d'erreur générique. */
export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-surface px-6 py-8 text-center"
    >
      <p className="font-display text-lg text-ink">Une erreur est survenue</p>
      <p className="mt-2 text-sm text-muted-ink">{message}</p>
    </div>
  );
}

/** Mention discrète signalant un contenu de démonstration. */
export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-line bg-frost-deep/40 px-4 py-3 text-[12px] leading-relaxed text-muted-ink">
      {children}
    </p>
  );
}
