import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { ShopNavbar } from "@/components/shop/ShopNavbar";

export default async function ProductDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <ProductDetailClient id={id} />
    </div>
  );
}
