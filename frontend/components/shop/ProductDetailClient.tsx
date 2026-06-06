"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Check, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { createPreOrder } from "@/lib/api/preorders";
import { getProduct } from "@/lib/api/products";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export function ProductDetailClient({ id }: Readonly<{ id: string }>) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isPreOrdering, setIsPreOrdering] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addToCart);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const { data: product, isError, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  if (isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-10 text-text-secondary">Loading product...</main>;
  }

  if (isError || !product) {
    return <main className="mx-auto max-w-6xl px-4 py-10 text-rose-300">Product could not be loaded.</main>;
  }

  async function handleAddToCart() {
    if (isCartLoading || !selectedVariant) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await addToCart(selectedVariant.id, 1);
      setAdded(true);
      toast.success("已加入購物車");
      window.setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      toast.error(getApiMessage(error, "加入購物車失敗，請稍後再試。"));
    }
  }

  async function handlePreOrder() {
    if (isPreOrdering || !selectedVariant) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsPreOrdering(true);
    try {
      const order = await createPreOrder(selectedVariant.id, 1);
      toast.success("預購成功！到貨後將通知您付款。");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(getApiMessage(error, "預購失敗，請稍後再試。"));
    } finally {
      setIsPreOrdering(false);
    }
  }

  const isPreOrder = selectedVariant?.isPreOrder === true;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="min-h-[460px] rounded-md border border-border-default bg-[radial-gradient(circle_at_30%_25%,rgba(139,92,246,0.22),transparent_35%),linear-gradient(135deg,#18181b,#050505)]" />
      <section className="space-y-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{product.category}</p>
          <h1 className="mt-3 text-4xl font-semibold text-text-primary">{product.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">{product.description}</p>
        </div>

        {selectedVariant ? (
          <div className={`rounded-md border p-4 ${isPreOrder ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/10" : "border-border-default bg-bg-secondary"}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-text-secondary">{isPreOrder ? "預購規格" : "已選規格"}</p>
                <p className="mt-1 font-medium text-text-primary">{selectedVariant.specName}</p>
              </div>
              <p className={`text-2xl font-semibold ${isPreOrder ? "text-[#C4B5FD]" : "text-text-primary"}`}>NT$ {selectedVariant.price.toLocaleString()}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              {isPreOrder ? (
                <>
                  <span className="inline-flex items-center gap-2 text-[#C4B5FD]">
                    <CalendarDays className="size-4" />
                    預計到貨：{selectedVariant.estimatedArrivalDate ? new Date(selectedVariant.estimatedArrivalDate).toLocaleDateString() : "尚未公布"}
                  </span>
                  <span>{selectedVariant.preOrderCount} 人已預購</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Package className="size-4 text-emerald-300" />
                  {selectedVariant.availableStock} available
                </span>
              )}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">Variants</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {product.variants.map((variant) => {
              const active = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isCartLoading || isPreOrdering}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`flex h-16 items-center justify-between rounded-md border px-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    active
                      ? variant.isPreOrder
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/15 text-text-primary"
                        : "border-emerald-300 bg-emerald-300/10 text-text-primary"
                      : "border-border-default bg-bg-secondary text-text-secondary hover:border-border-hover"
                  }`}
                >
                  <span>
                    <span className="block font-medium">{variant.specName}</span>
                    <span className="block text-xs text-text-tertiary">{variant.isPreOrder ? "Pre-order" : variant.sku}</span>
                  </span>
                  {active ? <Check className={`size-4 ${variant.isPreOrder ? "text-[#C4B5FD]" : "text-emerald-300"}`} /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {isPreOrder ? (
          <>
            <LoadingButton
              fullWidth
              isLoading={isPreOrdering}
              loadingText="預購中..."
              className="!bg-[#8B5CF6] !text-text-primary hover:!bg-[#7C3AED]"
              onClick={handlePreOrder}
            >
              預購
            </LoadingButton>
            <p className="rounded-md border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-3 text-sm text-[#C4B5FD]">
              預購商品到貨後會發送站內通知，請依通知期限完成付款。
            </p>
          </>
        ) : (
          <LoadingButton
            fullWidth
            isLoading={isCartLoading}
            loadingText="加入中..."
            disabled={!selectedVariant || selectedVariant.availableStock <= 0}
            onClick={handleAddToCart}
          >
            {selectedVariant && selectedVariant.availableStock <= 0 ? "Sold out" : added ? "已加入" : "加入購物車"}
          </LoadingButton>
        )}
      </section>
    </main>
  );
}

function getApiMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return fallback;
  }

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === "string" ? response.data.message : fallback;
}
