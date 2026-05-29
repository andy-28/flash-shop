"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { ContentBlock } from "@/types";
import { assetUrl } from "@/lib/utils/assetUrl";

export function HeroBanner({ items }: Readonly<{ items: ContentBlock[] }>) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const active = items[activeIndex] ?? items[0];
  const goPrevious = () => setActiveIndex((current) => (current - 1 + items.length) % items.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % items.length);
  const content = (
    <section className="group relative overflow-hidden bg-black text-white">
      <div className="relative aspect-[16/9] min-h-[460px] sm:aspect-[21/9] sm:min-h-[620px]">
      <Image
        src={assetUrl(active.imageUrl)}
        alt={active.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
      <div className="absolute inset-0 z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-8">
        <div className="max-w-3xl">
          {active.title ? <h1 className="text-4xl font-semibold leading-none text-white drop-shadow-2xl sm:text-6xl">{active.title}</h1> : null}
          {active.subtitle ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 drop-shadow sm:text-lg">{active.subtitle}</p> : null}
        </div>
        {items.length > 1 ? (
          <div className="mt-8 flex gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show banner ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/40"}`}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveIndex(index);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
      {items.length > 1 ? (
        <>
          <button aria-label="Previous banner" className="absolute left-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 sm:inline-flex" type="button" onClick={(event) => { event.preventDefault(); goPrevious(); }}>
            <ChevronLeft className="size-5" />
          </button>
          <button aria-label="Next banner" className="absolute right-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 sm:inline-flex" type="button" onClick={(event) => { event.preventDefault(); goNext(); }}>
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
      </div>
    </section>
  );

  if (!active.linkUrl) {
    return content;
  }

  if (active.linkType === "External") {
    return (
      <a href={active.linkUrl} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={active.linkUrl}>{content}</Link>;
}
