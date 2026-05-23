"use client";

import Image from "next/image";
import Link from "next/link";
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
  const content = (
    <section className="relative min-h-[68vh] overflow-hidden bg-black text-white">
      <Image
        src={assetUrl(active.imageUrl)}
        alt={active.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase text-emerald-300">{active.placement}</p>
          <h1 className="mt-3 text-5xl font-semibold leading-none sm:text-7xl">{active.title}</h1>
          {active.subtitle ? <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">{active.subtitle}</p> : null}
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
