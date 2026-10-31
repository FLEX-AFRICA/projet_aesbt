import { MediaFrame } from "@/components/ui-aesbt/MediaPlaceholder";
import type { BureauMember } from "@/types/content";

export function MemberCard({ member }: { member: BureauMember }) {
  return (
    <article className="flex flex-col">
      <MediaFrame image={member.photo} ratio="aspect-[4/5]" label="Portrait à venir" />
      <h3 className="mt-4 font-display text-lg tracking-tight text-ink">
        {member.name ?? "Nom à communiquer"}
      </h3>
      <p className="mt-1 text-[13px] text-muted-ink">{member.role}</p>
    </article>
  );
}
