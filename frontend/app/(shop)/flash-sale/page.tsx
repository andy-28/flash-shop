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
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#A0A0A0]">Limited drops</p>
            <h1 className="mt-3 text-4xl font-semibold">Flash Sale</h1>
          </div>
          <Flame className="size-8 text-[#EF4444]" />
        </div>

        {isLoading ? <p className="mt-8 text-sm text-zinc-400">Loading flash sales...</p> : null}
        {!isLoading && sales.length === 0 ? (
          <div className="mt-8 rounded-md border border-white/10 bg-[#141414] p-8 text-center text-zinc-400">
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
                className="rounded-md border border-white/10 bg-[#141414] p-5 transition hover:border-white/30"
                key={sale.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#EF4444]/15 px-2.5 py-1 text-xs font-medium text-[#EF4444]">{phase}</span>
                  <span className="text-xs text-zinc-500">{remaining}/{sale.totalStock} left</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold">{sale.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{sale.productName} / {sale.specName}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    {sale.originalPrice ? <p className="text-sm text-zinc-500 line-through">{money(sale.originalPrice)}</p> : null}
                    <p className="text-2xl font-semibold text-[#EF4444]">{money(sale.flashPrice)}</p>
                  </div>
                  <span className="text-sm text-zinc-400">View</span>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
