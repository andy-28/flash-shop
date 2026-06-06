import Link from "next/link";
import { RichTextDisplay } from "@/components/shop/RichTextDisplay";
import type { ContentBlock } from "@/types";
import { assetUrl } from "@/lib/utils/assetUrl";

export function PromoBanner({ item }: Readonly<{ item: ContentBlock | null }>) {
  if (!item) {
    return null;
  }

  const banner = (
    <section className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-xl border border-border-default bg-bg-secondary">
        <img alt={item.title} className="aspect-[16/7] w-full object-cover sm:aspect-[21/9]" src={assetUrl(item.imageUrl)} />
        {(item.title || item.subtitle) ? (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5 sm:p-8">
            <div className="max-w-2xl">
              {item.title ? <h2 className="text-2xl font-semibold text-white sm:text-4xl">{item.title}</h2> : null}
              {item.subtitle ? <p className="mt-2 text-sm text-white/75 sm:text-base">{item.subtitle}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
      {item.body ? (
        <div className="mt-4 rounded-md border border-border-default bg-bg-secondary p-5">
          <RichTextDisplay html={item.body} />
        </div>
      ) : null}
    </section>
  );

  if (!item.linkUrl) {
    return banner;
  }

  if (item.linkType === "External") {
    return <a href={item.linkUrl} rel="noreferrer" target="_blank">{banner}</a>;
  }

  return <Link href={item.linkUrl}>{banner}</Link>;
}
