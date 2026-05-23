"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getContentByPlacement } from "@/lib/api/content";
import { getProducts } from "@/lib/api/products";

export default function HomePage() {
  const { data: banners = [] } = useQuery({
    queryKey: ["content", "home_banner"],
    queryFn: () => getContentByPlacement("home_banner"),
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "latest"],
    queryFn: () => getProducts(),
  });

  const latestProducts = products.slice(0, 8);

  return (
    <main className="min-h-screen bg-black text-white">
      <ShopNavbar />
      {banners.length > 0 ? (
        <HeroBanner items={banners} />
      ) : (
        <section className="relative min-h-[68vh] overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(34,197,94,0.24),transparent_34%),linear-gradient(135deg,#0A0A0A,#1E1E1E)]">
          <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-medium uppercase text-emerald-300">
                <Sparkles className="size-4" />
                Content commerce system
              </p>
              <h1 className="mt-4 text-5xl font-semibold leading-none sm:text-7xl">
                Flash drops, stories, and shop moments.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
                Create homepage banners from the CMS, then connect them to products, campaigns, and limited releases.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black"
              >
                Browse products
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-white/10 bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium uppercase text-zinc-500">
                <ShoppingBag className="size-4" />
                Latest products
              </p>
              <h2 className="mt-3 text-3xl font-semibold">New drops ready to shop.</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {isLoading ? (
            <p className="py-10 text-zinc-400">Loading products...</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
