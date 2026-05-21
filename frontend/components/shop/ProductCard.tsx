import Link from "next/link";
import type { Product } from "@/types";

export function ProductCard({ product }: Readonly<{ product: Product }>) {
  const minPrice = product.minPrice ?? Math.min(...product.variants.map((variant) => variant.price));
  const stock = product.availableStock ?? product.variants.reduce((sum, variant) => sum + variant.availableStock, 0);

  return (
    <article className="group relative rounded-md border border-white/10 bg-zinc-950 p-4 transition hover:border-emerald-300/60 hover:bg-zinc-900">
      <div className="mb-4 aspect-[4/3] rounded-md bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.28),transparent_35%),linear-gradient(135deg,#18181b,#09090b)]" />
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">{product.category}</p>
      <h2 className="mt-2 min-h-12 text-lg font-semibold text-white group-hover:text-emerald-100">
        <Link href={`/products/${product.id}`} className="after:absolute after:inset-0">
          {product.name}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{product.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
        <span className="font-semibold text-white">NT$ {minPrice.toLocaleString()}</span>
        <span className={stock > 0 ? "text-emerald-300" : "text-rose-300"}>
          {stock > 0 ? `${stock} in stock` : "Sold out"}
        </span>
      </div>
    </article>
  );
}
