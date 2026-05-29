import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { FlashSale } from "@/types";

export function FlashSalePreview({ sales }: Readonly<{ sales: FlashSale[] }>) {
  if (sales.length === 0) {
    return null;
  }

  const primary = sales[0];
  const now = Date.now();
  const startsIn = Math.max(new Date(primary.startAt).getTime() - now, 0);
  const endsIn = Math.max(new Date(primary.endAt).getTime() - now, 0);
  const isStarted = startsIn === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#141414,#080808)]">
      <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr] lg:p-6">
        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium uppercase text-[#F59E0B]">
              <Flame className="size-4" />
              Flash Sale
            </p>
            <h3 className="mt-3 text-3xl font-semibold text-white">Limited drops, live stock.</h3>
            <p className="mt-3 text-sm leading-6 text-[#A0A0A0]">
              {isStarted ? `搶購中，剩餘 ${formatDuration(endsIn)}` : `即將開始，倒數 ${formatDuration(startsIn)}`}
            </p>
          </div>
          <Link href="/flash-sale" className="inline-flex w-fit items-center gap-2 text-sm text-white">
            查看全部
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-4">
            {sales.slice(0, 4).map((sale) => {
              const remaining = sale.remainingStock ?? Math.max(sale.totalStock - sale.soldCount, 0);
              const percent = sale.totalStock > 0 ? Math.max(Math.min((remaining / sale.totalStock) * 100, 100), 0) : 0;
              return (
                <Link className="w-56 shrink-0 rounded-lg border border-white/10 bg-black p-4 transition hover:border-white/30" href={`/flash-sale/${sale.id}`} key={sale.id}>
                  <div className="mb-4 aspect-[4/3] rounded-md bg-[radial-gradient(circle_at_30%_25%,rgba(245,158,11,0.28),transparent_35%),linear-gradient(135deg,#27272a,#09090b)]" />
                  <p className="line-clamp-1 text-sm font-medium text-white">{sale.title}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#A0A0A0]">{sale.productName} · {sale.specName}</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-lg font-semibold text-[#EF4444]">NT$ {sale.flashPrice.toLocaleString()}</span>
                    {sale.originalPrice ? <span className="pb-0.5 text-xs text-[#666666] line-through">NT$ {sale.originalPrice.toLocaleString()}</span> : null}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[#A0A0A0]">{remaining} / {sale.totalStock} left</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
