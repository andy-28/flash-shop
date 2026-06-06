import Link from "next/link";
import { Play } from "lucide-react";
import { StatusBadge, type BadgeVariant } from "@/components/admin/StatusBadge";
import { assetUrl } from "@/lib/utils/assetUrl";
import { relativeTime } from "@/lib/utils/relativeTime";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import type { ContentFeedItem } from "@/types";

interface ContentCardProps {
  content: ContentFeedItem;
  featured?: boolean;
}

const categoryVariants: Record<string, BadgeVariant> = {
  News: "info",
  Behind: "warning",
  Video: "danger",
  Event: "success",
};

export function ContentCard({ content, featured = false }: Readonly<ContentCardProps>) {
  const cover = content.imageUrl ? assetUrl(content.imageUrl) : content.videoUrl ? getYouTubeThumbnail(content.videoUrl) : null;
  const category = content.category ?? "News";

  return (
    <Link
      href={`/contents/${content.id}`}
      className={`group block overflow-hidden rounded-xl border border-border-default bg-bg-secondary transition hover:-translate-y-0.5 hover:border-border-hover ${
        featured ? "md:grid md:grid-cols-[1.25fr_0.75fr]" : ""
      }`}
    >
      <div className={`relative bg-bg-tertiary ${featured ? "aspect-video md:aspect-auto" : "aspect-[4/3]"}`}>
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : null}
        {content.videoUrl ? (
          <div className="absolute inset-0 grid place-items-center bg-black/25">
            <span className="grid size-14 place-items-center rounded-full bg-overlay text-text-primary backdrop-blur">
              <Play className="ml-1 size-6 fill-white" />
            </span>
          </div>
        ) : null}
      </div>
      <div className={featured ? "p-6 md:p-8" : "p-4"}>
        <StatusBadge label={category} variant={categoryVariants[category] ?? "neutral"} />
        <h2 className={`mt-4 line-clamp-2 font-semibold text-text-primary ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>{content.title}</h2>
        {content.summary || content.subtitle ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">{content.summary ?? content.subtitle}</p>
        ) : null}
        <p className="mt-4 text-xs text-text-tertiary">
          {relativeTime(content.publishedAt ?? content.createdAt)} · {content.viewCount.toLocaleString()} views
        </p>
      </div>
    </Link>
  );
}
