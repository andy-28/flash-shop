"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getProducts } from "@/lib/api/products";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => getProducts({ search: search || undefined }),
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Catalog</p>
            <h1 className="mt-3 text-4xl font-semibold">Products</h1>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 sm:max-w-sm">
            <Search className="size-4 text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              placeholder="Search products"
            />
          </label>
        </div>

        {isLoading ? (
          <p className="py-10 text-zinc-400">Loading products...</p>
        ) : (
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div className="animate-fadeInUp" key={product.id} style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
