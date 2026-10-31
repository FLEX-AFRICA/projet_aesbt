import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Resource } from "@/types/content";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-line bg-surface/60 p-6 transition-colors hover:bg-surface">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-ink">
        <span>{resource.category}</span>
        <span className="h-1 w-1 rounded-full bg-line" />
        <time dateTime={resource.publishedAt}>{formatDate(resource.publishedAt)}</time>
      </div>
      <h3 className="mt-3 font-display text-lg tracking-tight text-ink transition-colors group-hover:text-accent-blue">
        <Link href={`/ressources/${resource.slug}`}>{resource.title}</Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-ink text-pretty">
        {resource.description}
      </p>
      <p className="mt-4 text-[13px] font-semibold text-accent-blue">
        <Link href={`/ressources/${resource.slug}`}>Consulter</Link>
      </p>
    </article>
  );
}
