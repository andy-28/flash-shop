"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { createPost, getCategories } from "@/lib/api/community";
import { useAuthStore } from "@/stores/authStore";

export default function NewCommunityPostPage() {
  const router = useRouter();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: categories = [] } = useQuery({ queryKey: ["community-categories"], queryFn: getCategories });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: () => createPost({ title, category, content, imageUrl: imageUrl || null }),
    onMutate: () => setError(null),
    onSuccess: (post) => {
      toast.success("文章已發表");
      router.push(`/community/${post.id}`);
    },
    onError: () => {
      setError("文章發布失敗，請稍後再試。");
      toast.error("文章發布失敗，請稍後再試。");
    },
  });
  const isSubmitting = mutation.isPending;

  function submit() {
    if (isSubmitting || !title.trim() || !content.trim()) return;
    mutation.mutate();
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white">
        <ShopNavbar />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-zinc-300">請先登入後再發表文章。</p>
          <Link className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm text-black" href="/login">
            前往登入
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs text-zinc-500">Community / New Post</p>
        <h1 className="mt-2 text-3xl font-semibold">發表新文章</h1>
        <div aria-busy={isSubmitting} className="mt-8 grid gap-5 rounded-xl border border-white/10 bg-[#141414] p-5">
          <label className="grid gap-2 text-sm text-zinc-300">
            Category
            <select className="h-10 rounded-md border border-white/10 bg-black px-3 text-white disabled:opacity-60" value={category} onChange={(event) => setCategory(event.target.value)} disabled={isSubmitting}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Title
            <input className="h-11 rounded-md border border-white/10 bg-black px-3 text-white outline-none disabled:opacity-60" value={title} onChange={(event) => setTitle(event.target.value)} disabled={isSubmitting} />
          </label>
          <div className="grid gap-2 text-sm text-zinc-300">
            Content
            <RichTextEditor value={content} onChange={setContent} placeholder="分享你的開箱、穿搭、問題或想法..." />
          </div>
          <div className="grid gap-2 text-sm text-zinc-300">
            Image
            <MediaPicker folder="community" value={imageUrl} onChange={(url) => setImageUrl(url)} />
          </div>
          {error ? <p className="text-sm text-[#EF4444]">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <Link className={`inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm text-zinc-300 ${isSubmitting ? "pointer-events-none opacity-50" : "hover:bg-white/10"}`} href="/community">
              取消
            </Link>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-60" disabled={!title.trim() || !content.trim() || isSubmitting} type="button" onClick={submit}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? "發布中..." : "發布文章"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
