"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedProducts } from "@/components/shop/FeaturedProducts";
import { FlashSalePreview } from "@/components/shop/FlashSalePreview";
import { Footer } from "@/components/shop/Footer";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { PromoBanner } from "@/components/shop/PromoBanner";
import { Section } from "@/components/shop/Section";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { StoryCircles } from "@/components/shop/StoryCircles";
import { getContentByPlacement } from "@/lib/api/content";
import { getActiveFlashSales } from "@/lib/api/flashSale";
import { getProducts } from "@/lib/api/products";

export default function HomePage() {
  const bannersQuery = useQuery({
    queryKey: ["content", "home_banner"],
    queryFn: () => getContentByPlacement("home_banner"),
  });
  const storiesQuery = useQuery({
    queryKey: ["content", "home_story"],
    queryFn: () => getContentByPlacement("home_story"),
  });
  const promosQuery = useQuery({
    queryKey: ["content", "home_promo"],
    queryFn: () => getContentByPlacement("home_promo"),
  });
  const flashSalesQuery = useQuery({
    queryKey: ["flash-sale", "active"],
    queryFn: getActiveFlashSales,
  });
  const featuredQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getProducts({ page: 1, pageSize: 8, sortBy: "created_at_desc" }),
  });
  const latestQuery = useQuery({
    queryKey: ["products", "latest"],
    queryFn: () => getProducts({ page: 1, pageSize: 8 }),
  });

  const banners = bannersQuery.data ?? [];
  const stories = storiesQuery.data ?? [];
  const promos = promosQuery.data ?? [];
  const flashSales = flashSalesQuery.data ?? [];
  const featuredProducts = (featuredQuery.data ?? []).slice(0, 8);
  const latestProducts = (latestQuery.data ?? []).slice(0, 8);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      {bannersQuery.isLoading ? <HeroSkeleton /> : banners.length > 0 ? <HeroBanner items={banners} /> : <FallbackHero />}

      <div className="pt-8">
        {storiesQuery.isLoading ? (
          <Section>
            <StorySkeleton />
          </Section>
        ) : stories.length > 0 ? (
          <Section>
            <StoryCircles items={stories} />
          </Section>
        ) : null}

        {flashSalesQuery.isLoading ? (
          <Section title="Flash Sale" subtitle="限時搶購" action={{ label: "查看全部", href: "/flash-sale" }}>
            <BlockSkeleton />
          </Section>
        ) : flashSales.length > 0 ? (
          <Section title="Flash Sale" subtitle="限時搶購" action={{ label: "查看全部", href: "/flash-sale" }}>
            <FlashSalePreview sales={flashSales} />
          </Section>
        ) : null}

        {featuredQuery.isLoading ? (
          <Section title="Featured" subtitle="精選商品" action={{ label: "查看全部", href: "/products" }}>
            <ProductGridSkeleton />
          </Section>
        ) : featuredProducts.length > 0 ? (
          <Section title="Featured" subtitle="精選商品" action={{ label: "查看全部", href: "/products" }}>
            <FeaturedProducts products={featuredProducts} />
          </Section>
        ) : null}

        {promosQuery.isLoading ? (
          <section className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="aspect-[16/7] animate-pulse rounded-xl bg-[#141414] sm:aspect-[21/9]" />
          </section>
        ) : (
          <PromoBanner item={promos[0] ?? null} />
        )}

        {latestQuery.isLoading ? (
          <Section title="New Arrivals" subtitle="最新上架" action={{ label: "查看全部", href: "/products" }}>
            <ProductGridSkeleton />
          </Section>
        ) : latestProducts.length > 0 ? (
          <Section title="New Arrivals" subtitle="最新上架" action={{ label: "查看全部", href: "/products" }}>
            <FeaturedProducts products={latestProducts} />
          </Section>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}

function FallbackHero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,#0A0A0A,#1E1E1E)]">
      <div className="mx-auto flex aspect-[16/9] min-h-[460px] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:aspect-[21/9] sm:min-h-[620px] sm:px-6 sm:pb-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm font-medium uppercase text-zinc-400">
            <Sparkles className="size-4" />
            Content commerce system
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-none sm:text-7xl">Flash drops, stories, and shop moments.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            Build editorial storefronts from CMS placements, products, campaigns, and limited releases.
          </p>
          <Link href="/products" className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black">
            Browse products
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return <div className="aspect-[16/9] min-h-[460px] animate-pulse bg-[#141414] sm:aspect-[21/9] sm:min-h-[620px]" />;
}

function StorySkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="w-20 shrink-0 sm:w-24" key={index}>
          <div className="mx-auto size-16 animate-pulse rounded-full bg-[#252525] sm:size-[72px]" />
          <div className="mx-auto mt-3 h-3 w-14 animate-pulse rounded bg-[#252525]" />
        </div>
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="rounded-md border border-white/10 bg-[#141414] p-3" key={index}>
          <div className="aspect-[4/3] animate-pulse rounded bg-[#252525]" />
          <div className="mt-4 h-3 w-20 animate-pulse rounded bg-[#252525]" />
          <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-[#252525]" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#252525]" />
        </div>
      ))}
    </div>
  );
}

function BlockSkeleton() {
  return <div className="h-72 animate-pulse rounded-xl border border-white/10 bg-[#141414]" />;
}
