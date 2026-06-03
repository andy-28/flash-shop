import { ContentCard } from "@/components/shop/ContentCard";
import type { ContentFeedItem } from "@/types";

interface LatestContentsListProps {
  items: ContentFeedItem[];
}

export function LatestContentsList({ items }: Readonly<LatestContentsListProps>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}
