"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/api/products";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export function ProductDetailClient({ id }: Readonly<{ id: string }>) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addToCart);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const { data: product, isError, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const selectedVariant = useMemo(() => {
    if (!product) {
      return null;
    }

    return product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  if (isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-10 text-zinc-400">Loading product...</main>;
  }

  if (isError || !product) {
    return <main className="mx-auto max-w-6xl px-4 py-10 text-rose-300">Product could not be loaded.</main>;
  }

  async function handleAddToCart() {
    if (!selectedVariant) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    await addToCart(selectedVariant.id, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="min-h-[460px] rounded-md border border-white/10 bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.25),transparent_35%),linear-gradient(135deg,#18181b,#050505)]" />
      <section className="space-y-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{product.category}</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{product.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">{product.description}</p>
        </div>

        {selectedVariant ? (
          <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">Selected variant</p>
                <p className="mt-1 font-medium text-white">{selectedVariant.specName}</p>
              </div>
              <p className="text-2xl font-semibold text-white">NT$ {selectedVariant.price.toLocaleString()}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
              <Package className="size-4 text-emerald-300" />
              {selectedVariant.availableStock} available
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-medium text-white">Variants</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {product.variants.map((variant) => {
              const active = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`flex h-14 items-center justify-between rounded-md border px-3 text-left text-sm transition ${
                    active
                      ? "border-emerald-300 bg-emerald-300/10 text-white"
                      : "border-white/10 bg-zinc-950 text-zinc-300 hover:border-white/30"
                  }`}
                >
                  <span>
                    <span className="block font-medium">{variant.specName}</span>
                    <span className="block text-xs text-zinc-500">{variant.sku}</span>
                  </span>
                  {active ? <Check className="size-4 text-emerald-300" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          className="h-10 w-full rounded-md"
          disabled={!selectedVariant || selectedVariant.availableStock <= 0 || isCartLoading}
          onClick={handleAddToCart}
        >
          {selectedVariant && selectedVariant.availableStock <= 0 ? "售罄" : added ? "已加入 ✓" : "加入購物車"}
        </Button>
      </section>
    </main>
  );
}
