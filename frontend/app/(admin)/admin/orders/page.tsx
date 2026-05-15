import { Filter, ShoppingCart } from "lucide-react";

const orders = [
  ["FS-1008", "Paid", "2 items", "$112"],
  ["FS-1007", "Pending", "1 item", "$88"],
  ["FS-1006", "Packed", "3 items", "$156"],
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase text-slate-500">Commerce</p>
          <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium">
          <Filter className="size-4" />
          Filter
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-slate-500">
          <span>Order</span>
          <span>Status</span>
          <span>Items</span>
          <span className="text-right">Total</span>
        </div>
        {orders.map(([id, status, items, total]) => (
          <div className="grid grid-cols-4 px-4 py-4 text-sm" key={id}>
            <span className="flex items-center gap-2 font-medium">
              <ShoppingCart className="size-4 text-slate-500" />
              {id}
            </span>
            <span>{status}</span>
            <span className="text-slate-600">{items}</span>
            <span className="text-right">{total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
