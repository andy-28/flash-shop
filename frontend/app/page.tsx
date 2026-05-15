import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Disc3, ShoppingBag, Sparkles } from "lucide-react";

const navItems = ["Home", "Story", "Contents", "Community", "Shop"];

const drops = [
  { title: "Signal Hoodie", type: "Apparel", status: "Live now" },
  { title: "Chrome Photo Card Set", type: "Collectible", status: "Members first" },
  { title: "Flash Capsule", type: "Limited drop", status: "Opens Friday" },
];

const stories = [
  "Editorial drops with product storytelling.",
  "Community releases, events, and preorder windows.",
  "CMS controlled banners, products, posts, and shop settings.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#111111]">
      <header className="fixed left-0 right-0 top-0 z-20 border-b border-white/20 bg-black/35 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-semibold uppercase tracking-normal">
            FlashShop
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-medium uppercase md:flex">
            {navItems.map((item) => (
              <a href={`#${item.toLowerCase()}`} key={item}>
                {item}
              </a>
            ))}
          </nav>
          <Link
            href="/admin/dashboard"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-black"
          >
            CMS
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <section id="home" className="relative min-h-[82vh] overflow-hidden bg-black text-white">
        <Image
          src="/flashshop-hero.png"
          alt="FlashShop editorial merchandise display"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium uppercase text-lime-200">
              <Sparkles className="size-4" />
              Content commerce system
            </p>
            <h1 className="text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
              Flash drops, stories, and shop moments.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              A storefront concept for limited products, community content, campaign banners,
              and CMS-managed merchandising.
            </p>
          </div>
        </div>
      </section>

      <section id="story" className="border-b border-black/10 bg-[#f6f4ef]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase text-[#6d6a62]">What this becomes</p>
            <h2 className="mt-3 text-3xl font-semibold">A CMS-first ecommerce surface.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {stories.map((story) => (
              <div className="rounded-md border border-black/10 bg-white p-4" key={story}>
                <p className="text-sm leading-6 text-[#3f3c37]">{story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contents" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase text-[#6d6a62]">Featured contents</p>
              <h2 className="mt-2 text-3xl font-semibold">Campaign modules ready for CMS.</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium">
              View shop
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {drops.map((drop) => (
              <article className="rounded-md border border-black/10 bg-[#f6f4ef] p-5" key={drop.title}>
                <div className="mb-10 flex items-center justify-between text-sm text-[#6d6a62]">
                  <span>{drop.type}</span>
                  <ShoppingBag className="size-4" />
                </div>
                <h3 className="text-xl font-semibold">{drop.title}</h3>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f3c37]">
                  <CalendarDays className="size-4" />
                  {drop.status}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="community" className="bg-[#111111] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase text-lime-200">Community</p>
            <h2 className="mt-3 text-3xl font-semibold">Build around releases, not static products.</h2>
          </div>
          <div className="grid gap-3">
            {["Member-only launch windows", "Editorial content scheduling", "Order and inventory overview"].map((item) => (
              <div className="flex items-center gap-3 border-b border-white/15 py-4" key={item}>
                <Disc3 className="size-5 text-lime-200" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
