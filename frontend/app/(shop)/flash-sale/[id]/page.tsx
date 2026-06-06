"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Flame } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
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
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [now, setNow] = useState(() => Date.now());
  const [remainingStock, setRemainingStock] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<"idle" | "success" | "failed">("idle");
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
    if (isPurchasing || purchaseResult === "success") return;

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
      setPurchaseResult("success");
      setMessage("Purchase accepted. Your order is being created.");
      toast.success("搶購成功！訂單建立中...");
      window.setTimeout(() => router.push("/orders"), 1200);
    } catch (exception) {
      const axiosError = exception as AxiosError<{ message?: string }>;
      const nextError = axiosError.response?.data?.message ?? "Purchase failed.";
      setPurchaseResult("failed");
      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <ShopNavbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? <p className="text-sm text-text-secondary">Loading flash sale...</p> : null}
        {sale ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-md border border-border-default bg-bg-secondary p-6">
              <div className="flex size-20 items-center justify-center rounded-full bg-status-danger/15 text-status-danger">
                <Flame className="size-9" />
              </div>
              <p className="mt-6 text-sm text-text-secondary">{sale.productName} / {sale.specName}</p>
              <h1 className="mt-2 text-4xl font-semibold">{sale.title}</h1>
              <div className="mt-6 flex items-end gap-4">
                {sale.originalPrice ? <span className="text-lg text-text-tertiary line-through">{money(sale.originalPrice)}</span> : null}
                <span className="text-4xl font-semibold text-status-danger">{money(sale.flashPrice)}</span>
              </div>
            </section>

            <aside className="h-fit rounded-md border border-border-default bg-bg-secondary p-5 lg:sticky lg:top-20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Remaining stock</span>
                <span className="font-semibold">{remainingStock ?? 0}/{sale.totalStock}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-tertiary">
                <div className="h-full bg-status-danger" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-6 rounded-md border border-border-default bg-bg-tertiary p-4">
                {phase === "upcoming" ? (
                  <>
                    <p className="text-sm text-text-secondary">Starts in</p>
                    <p className="mt-1 animate-scale-in text-2xl font-semibold" key={Math.floor(now / 1000)}>{formatRemaining(new Date(sale.startAt).getTime() - now)}</p>
                  </>
                ) : null}
                {phase === "live" ? <p className="text-sm text-status-success">Flash sale is live.</p> : null}
                {phase === "sold-out" ? <p className="text-sm text-status-danger">Sold out.</p> : null}
                {phase === "ended" ? <p className="text-sm text-text-secondary">Flash sale ended.</p> : null}
              </div>

              {error ? <p className="mt-4 text-sm text-status-danger">{error}</p> : null}
              {message ? <p className="mt-4 text-sm text-status-success">{message}</p> : null}

              <LoadingButton
                className="mt-5"
                fullWidth
                size="lg"
                isLoading={isPurchasing}
                loadingText="搶購中..."
                disabled={phase !== "live" || purchaseResult === "success"}
                onClick={purchase}
              >
                {purchaseResult === "success" ? "✓ 搶購成功" : phase === "sold-out" ? "Sold out" : "Purchase now"}
              </LoadingButton>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
