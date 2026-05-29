import Link from "next/link";
import type { Product } from "@/types";
import { assetUrl } from "@/lib/utils/assetUrl";

export function ProductCard({ product }: Readonly<{ product: Product }>) {
  const minPrice = product.minPrice ?? Math.min(...product.variants.map((variant) => variant.price));
  const stock = product.availableStock ?? product.variants.reduce((sum, variant) => sum + variant.availableStock, 0);

  return (
    <article className="group relative overflow-hidden rounded-md border border-white/10 bg-[#141414] transition hover:border-white/30 hover:bg-[#1E1E1E]">
      {product.imageUrl ? (
        <img alt={product.name} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={assetUrl(product.imageUrl)} />
      ) : (
        <div className="aspect-[4/3] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.16),transparent_35%),linear-gradient(135deg,#18181b,#09090b)]" />
      )}
      <div className="p-4">
      <p className="text-xs uppercase text-[#A0A0A0]">{product.category}</p>
      <h2 className="mt-2 min-h-12 text-base font-semibold text-white group-hover:text-zinc-200 sm:text-lg">
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
      </div>
    </article>
  );
}
