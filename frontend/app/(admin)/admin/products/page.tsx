import { PackagePlus, Search } from "lucide-react";

const products = [
  ["Signal Hoodie", "Apparel", "Active", "$88"],
  ["Chrome Photo Card Set", "Collectible", "Members", "$24"],
  ["Flash Capsule Box", "Bundle", "Scheduled", "$120"],
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase text-slate-500">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold">Products</h1>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white">
          <PackagePlus className="size-4" />
          Add product
        </button>
      </div>

      <div className="flex h-10 max-w-md items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
        <Search className="size-4 text-slate-500" />
        <span className="text-sm text-slate-500">Search products</span>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-slate-500">
          <span>Product</span>
          <span>Type</span>
          <span>Status</span>
          <span className="text-right">Price</span>
        </div>
        {products.map(([name, type, status, price]) => (
          <div className="grid grid-cols-4 px-4 py-4 text-sm" key={name}>
            <span className="font-medium">{name}</span>
            <span className="text-slate-600">{type}</span>
            <span>{status}</span>
            <span className="text-right">{price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
