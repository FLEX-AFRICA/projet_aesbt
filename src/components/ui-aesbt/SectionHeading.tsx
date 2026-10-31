import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; to: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl text-balance">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-ink text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          href={action.to as any}
          className="text-[13px] font-semibold text-accent-blue underline-offset-4 hover:underline"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
