"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Flame, Loader2 } from "lucide-react";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getFlashSale, getFlashSaleStock, purchaseFlashSale } from "@/lib/api/flashSale";
import { useAuthStore } from "@/stores/authStore";

function money(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

function formatRemaining(ms: number) {
  const seconds = Math.max(Math.floor(ms / 1000), 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

export default function FlashSaleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [now, setNow] = useState(() => Date.now());
  const [remainingStock, setRemainingStock] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: sale, isLoading } = useQuery({
    queryKey: ["flash-sale", params.id],
    queryFn: () => getFlashSale(params.id),
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sale) return;
    setRemainingStock(sale.remainingStock ?? Math.max(sale.totalStock - sale.soldCount, 0));
  }, [sale]);

  useEffect(() => {
    if (!sale || sale.status !== "Active") return;
    const timer = window.setInterval(async () => {
      const stock = await getFlashSaleStock(sale.id);
      setRemainingStock(stock.remainingStock);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [sale]);

  const phase = useMemo(() => {
    if (!sale) return "loading";
    if (now < new Date(sale.startAt).getTime()) return "upcoming";
    if (now >= new Date(sale.endAt).getTime()) return "ended";
    if ((remainingStock ?? 0) <= 0) return "sold-out";
    return "live";
  }, [now, remainingStock, sale]);

  const progress = sale && remainingStock !== null ? Math.max(Math.min((remainingStock / sale.totalStock) * 100, 100), 0) : 0;

  const purchase = async () => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsPurchasing(true);
    setError(null);
    setMessage(null);
    try {
      const result = await purchaseFlashSale(params.id);
      setRemainingStock(result.remainingStock);
      setMessage("Purchase accepted. Your order is being created.");
      window.setTimeout(() => router.push("/orders"), 1200);
    } catch (exception) {
      const axiosError = exception as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Purchase failed.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? <p className="text-sm text-zinc-400">Loading flash sale...</p> : null}
        {sale ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-md border border-white/10 bg-[#141414] p-6">
              <div className="flex size-20 items-center justify-center rounded-full bg-[#EF4444]/15 text-[#EF4444]">
                <Flame className="size-9" />
              </div>
              <p className="mt-6 text-sm text-zinc-400">{sale.productName} / {sale.specName}</p>
              <h1 className="mt-2 text-4xl font-semibold">{sale.title}</h1>
              <div className="mt-6 flex items-end gap-4">
                {sale.originalPrice ? <span className="text-lg text-zinc-500 line-through">{money(sale.originalPrice)}</span> : null}
                <span className="text-4xl font-semibold text-[#EF4444]">{money(sale.flashPrice)}</span>
              </div>
            </section>

            <aside className="h-fit rounded-md border border-white/10 bg-[#141414] p-5 lg:sticky lg:top-20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Remaining stock</span>
                <span className="font-semibold">{remainingStock ?? 0}/{sale.totalStock}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#EF4444]" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-6 rounded-md border border-white/10 bg-black/30 p-4">
                {phase === "upcoming" ? (
                  <>
                    <p className="text-sm text-zinc-400">Starts in</p>
                    <p className="mt-1 text-2xl font-semibold">{formatRemaining(new Date(sale.startAt).getTime() - now)}</p>
                  </>
                ) : null}
                {phase === "live" ? <p className="text-sm text-[#22C55E]">Flash sale is live.</p> : null}
                {phase === "sold-out" ? <p className="text-sm text-[#EF4444]">Sold out.</p> : null}
                {phase === "ended" ? <p className="text-sm text-zinc-400">Flash sale ended.</p> : null}
              </div>

              {error ? <p className="mt-4 text-sm text-[#EF4444]">{error}</p> : null}
              {message ? <p className="mt-4 text-sm text-[#22C55E]">{message}</p> : null}

              <button
                type="button"
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-black disabled:opacity-40"
                disabled={phase !== "live" || isPurchasing}
                onClick={purchase}
              >
                {isPurchasing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {phase === "sold-out" ? "Sold out" : "Purchase now"}
              </button>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
