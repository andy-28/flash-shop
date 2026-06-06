import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-primary">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-6 text-xs text-text-tertiary sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>FlashShop © 2026</p>
        <div className="flex gap-4">
          <Link href="/products" className="hover:text-text-primary">Products</Link>
          <Link href="/flash-sale" className="hover:text-text-primary">Flash Sale</Link>
          <Link href="/admin/dashboard" className="hover:text-text-primary">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
