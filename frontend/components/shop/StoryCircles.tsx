"use client";

import { useCallback, useEffect, useState } from "react";
import { StoryViewer } from "@/components/shop/StoryViewer";
import type { ContentBlock } from "@/types";
import { assetUrl } from "@/lib/utils/assetUrl";

const viewedStoriesKey = "viewed_stories";

export function StoryCircles({ items }: Readonly<{ items: ContentBlock[] }>) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setViewedStoryIds(readViewedStories());
  }, []);

  const markAsViewed = useCallback((storyId: string) => {
    setViewedStoryIds((current) => {
      if (current.has(storyId)) {
        return current;
      }
      const next = new Set(current);
      next.add(storyId);
      writeViewedStories(next);
      return next;
    });
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x gap-4 pb-1">
          {items.map((item, index) => {
            const viewed = viewedStoryIds.has(item.id);
            return (
              <button
                className="w-20 snap-start text-center sm:w-24"
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedIndex(index);
                  setViewerOpen(true);
                }}
              >
                <div
                  className={`mx-auto grid size-16 place-items-center rounded-full p-[2px] sm:size-[72px] ${
                    viewed
                      ? "bg-white/20"
                      : "bg-[conic-gradient(from_180deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888,#f09433)]"
                  }`}
                >
                  <img alt={item.title} className="size-full rounded-full border-2 border-black object-cover" src={assetUrl(item.imageUrl)} />
                </div>
                <p className={`mt-2 line-clamp-2 text-xs leading-4 ${viewed ? "text-white/45" : "text-text-primary"}`}>{item.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {viewerOpen ? (
        <StoryViewer
          stories={items}
          initialIndex={selectedIndex}
          onClose={() => setViewerOpen(false)}
          onViewed={markAsViewed}
        />
      ) : null}
    </>
  );
}

function readViewedStories() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const value = window.localStorage.getItem(viewedStoriesKey);
    const ids = value ? (JSON.parse(value) as string[]) : [];
    return new Set(ids);
  } catch {
    return new Set<string>();
  }
}

function writeViewedStories(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(viewedStoriesKey, JSON.stringify(Array.from(ids)));
}
