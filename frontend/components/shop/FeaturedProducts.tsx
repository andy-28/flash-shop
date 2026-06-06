import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: Readonly<{ products: Product[] }>) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {products.map((product, index) => (
        <div className="animate-fade-in-up" key={product.id} style={{ animationDelay: `${Math.min(index, 7) * 50}ms` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
