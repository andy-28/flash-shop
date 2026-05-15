import Link from "next/link";

const items = [
  { href: "/admin/dashboard", label: "儀表板" },
  { href: "/admin/products", label: "商品" },
  { href: "/admin/orders", label: "訂單" },
];

export function Sidebar() {
  return (
    <aside className="border-r p-4">
      <div className="mb-4 font-semibold">FlashShop Admin</div>
      <nav className="grid gap-2">
        {items.map((item) => (
          <Link className="text-sm" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
