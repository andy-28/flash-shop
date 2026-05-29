import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: Readonly<{ products: Product[] }>) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
