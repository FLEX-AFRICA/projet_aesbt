import { cn } from "@/lib/utils";
import type { ContentImage } from "@/types/content";

/**
 * Affiche une image réelle lorsqu'elle existe, sinon un emplacement neutre
 * clairement identifié (aucune illustration inventée).
 */
export function MediaFrame({
  image,
  ratio = "aspect-[16/10]",
  className,
  label = "Photo à venir",
}: {
  image?: ContentImage;
  ratio?: string;
  className?: string;
  label?: string;
}) {
  if (image?.src) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className={cn("w-full rounded-lg object-cover", ratio, className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={image?.alt ?? label}
      className={cn(
        "grid w-full place-items-center rounded-lg bg-frost-deep/70 outline-1 -outline-offset-1 outline-ink/5",
        ratio,
        className,
      )}
    >
      <span className="px-4 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-muted-ink">
        {label}
      </span>
    </div>
  );
}
