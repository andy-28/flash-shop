import type { Product } from "@/types";

export function ProductCard({ product }: Readonly<{ product: Product }>) {
  return (
    <article className="rounded-md border p-4">
      <h2 className="font-semibold">{product.name}</h2>
      <p className="text-sm text-muted-foreground">{product.category}</p>
    </article>
  );
}
