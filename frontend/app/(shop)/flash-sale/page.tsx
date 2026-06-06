"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getActiveFlashSales } from "@/lib/api/flashSale";

function money(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

function getPhase(startAt: string, endAt: string) {
  const now = Date.now();
  if (now < new Date(startAt).getTime()) return "Upcoming";
  if (now >= new Date(endAt).getTime()) return "Ended";
  return "Live";
}

export default function FlashSalePage() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["flash-sales"],
    queryFn: getActiveFlashSales,
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <ShopNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">Limited drops</p>
            <h1 className="mt-3 text-4xl font-semibold">Flash Sale</h1>
          </div>
          <Flame className="size-8 text-status-danger" />
        </div>

        {isLoading ? <p className="mt-8 text-sm text-text-secondary">Loading flash sales...</p> : null}
        {!isLoading && sales.length === 0 ? (
          <div className="mt-8 rounded-md border border-border-default bg-bg-secondary p-8 text-center text-text-secondary">
            No active flash sales yet.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sales.map((sale) => {
            const phase = getPhase(sale.startAt, sale.endAt);
            const remaining = sale.remainingStock ?? Math.max(sale.totalStock - sale.soldCount, 0);

            return (
              <Link
                href={`/flash-sale/${sale.id}`}
                className="rounded-md border border-border-default bg-bg-secondary p-5 transition hover:border-border-hover"
                key={sale.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-status-danger/15 px-2.5 py-1 text-xs font-medium text-status-danger">{phase}</span>
                  <span className="text-xs text-text-tertiary">{remaining}/{sale.totalStock} left</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold">{sale.title}</h2>
                <p className="mt-2 text-sm text-text-secondary">{sale.productName} / {sale.specName}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    {sale.originalPrice ? <p className="text-sm text-text-tertiary line-through">{money(sale.originalPrice)}</p> : null}
                    <p className="text-2xl font-semibold text-status-danger">{money(sale.flashPrice)}</p>
                  </div>
                  <span className="text-sm text-text-secondary">View</span>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
