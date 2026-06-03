"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";
import { ContentCard } from "@/components/shop/ContentCard";
import { RichTextDisplay } from "@/components/shop/RichTextDisplay";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { YouTubePlayer } from "@/components/shop/YouTubePlayer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getContentDetail } from "@/lib/api/content";
import { assetUrl } from "@/lib/utils/assetUrl";
import { relativeTime } from "@/lib/utils/relativeTime";

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { data: content, isLoading } = useQuery({
    queryKey: ["content-detail", params.id],
    queryFn: () => getContentDetail(params.id),
  });

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/contents" className="mb-8 inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white">
          <ArrowLeft className="size-4" />
          Back to Contents
        </Link>

        {isLoading || !content ? (
          <div className="h-[640px] animate-pulse rounded-xl bg-[#141414]" />
        ) : (
          <>
            {content.videoUrl ? (
              <YouTubePlayer url={content.videoUrl} />
            ) : content.imageUrl ? (
              <img src={assetUrl(content.imageUrl)} alt="" className="aspect-video w-full rounded-xl border border-[#2A2A2A] object-cover" />
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
              <StatusBadge label={content.category ?? "News"} variant={getCategoryVariant(content.category)} />
              <span>{relativeTime(content.publishedAt ?? content.createdAt)}</span>
              <span>{content.viewCount.toLocaleString()} views</span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">{content.title}</h1>
            {content.subtitle ? <p className="mt-4 text-lg leading-8 text-[#A0A0A0]">{content.subtitle}</p> : null}
            {content.summary ? <p className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 text-sm leading-7 text-[#A0A0A0]">{content.summary}</p> : null}

            <div className="my-8 border-t border-[#2A2A2A]" />
            {content.body ? <RichTextDisplay html={content.body} /> : null}

            {content.media.length > 0 ? (
              <>
                <div className="my-8 border-t border-[#2A2A2A]" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {content.media.map((media) => (
                    <button type="button" key={media.id} onClick={() => setLightbox(media.mediaUrl)} className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414]">
                      <img src={assetUrl(media.mediaUrl)} alt="" className="aspect-[4/3] w-full object-cover transition hover:scale-[1.02]" />
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {content.relatedContents.length > 0 ? (
              <>
                <div className="my-8 border-t border-[#2A2A2A]" />
                <section>
                  <h2 className="mb-4 text-xl font-semibold">Related Contents</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {content.relatedContents.map((item) => (
                      <ContentCard key={item.id} content={item} />
                    ))}
                  </div>
                </section>
              </>
            ) : null}
          </>
        )}
      </article>

      {lightbox ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4">
          <button type="button" className="absolute right-5 top-5 text-white" onClick={() => setLightbox(null)} aria-label="Close image">
            <X className="size-6" />
          </button>
          <img src={assetUrl(lightbox)} alt="" className="max-h-[88vh] max-w-full rounded-xl object-contain" />
        </div>
      ) : null}
    </main>
  );
}

function getCategoryVariant(category: string | null | undefined) {
  if (category === "Behind") return "warning" as const;
  if (category === "Video") return "danger" as const;
  if (category === "Event") return "success" as const;
  return "info" as const;
}
