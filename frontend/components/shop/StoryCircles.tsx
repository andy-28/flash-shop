import Link from "next/link";
import type { ContentBlock } from "@/types";
import { assetUrl } from "@/lib/utils/assetUrl";

export function StoryCircles({ items }: Readonly<{ items: ContentBlock[] }>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
      <div className="flex snap-x gap-4 pb-1">
        {items.map((item) => {
          const content = (
            <div className="w-20 snap-start text-center sm:w-24">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[conic-gradient(from_180deg,#FFFFFF,#666666,#FFFFFF)] p-[2px] sm:size-[72px]">
                <img alt={item.title} className="size-full rounded-full border-2 border-black object-cover" src={assetUrl(item.imageUrl)} />
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-4 text-white">{item.title}</p>
            </div>
          );

          if (!item.linkUrl) {
            return <div key={item.id}>{content}</div>;
          }

          if (item.linkType === "External") {
            return <a href={item.linkUrl} key={item.id} rel="noreferrer" target="_blank">{content}</a>;
          }

          return <Link href={item.linkUrl} key={item.id}>{content}</Link>;
        })}
      </div>
    </div>
  );
}
