"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "@/components/shop/ContentCard";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getContentCategories, getContentsFeed } from "@/lib/api/content";

export default function ContentsPage() {
  const [category, setCategory] = useState("All");
  const { data: categories = ["News", "Behind", "Video", "Event"] } = useQuery({
    queryKey: ["content-feed-categories"],
    queryFn: getContentCategories,
  });
  const { data, isLoading } = useQuery({
    queryKey: ["content-feed", category],
    queryFn: () => getContentsFeed({ category: category === "All" ? undefined : category, page: 1, pageSize: 24 }),
  });
  const items = data?.items ?? [];
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#666666]">Official channel</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Contents</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A0A0A0]">官方最新內容、幕後花絮、影片與活動公告。</p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories].map((item) => {
            const active = category === item;
            return (
              <button
                type="button"
                key={item}
                className={`h-9 shrink-0 rounded-full border px-4 text-sm transition ${
                  active ? "border-white bg-white text-black" : "border-[#2A2A2A] text-white hover:border-[#404040]"
                }`}
                onClick={() => setCategory(item)}
              >
                {item === "Behind" ? "Behind the Scenes" : item}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <ContentsSkeleton />
        ) : items.length === 0 ? (
          <div className="grid min-h-80 place-items-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#141414] text-[#A0A0A0]">
            目前沒有內容
          </div>
        ) : (
          <div className="grid gap-5">
            {featured ? <ContentCard content={featured} featured /> : null}
            {rest.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {rest.map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function ContentsSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="h-[420px] shimmer rounded-xl" />
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-80 shimmer rounded-xl" />
        ))}
      </div>
    </div>
  );
}
