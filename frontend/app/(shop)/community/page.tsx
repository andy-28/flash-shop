"use client";

import Link from "next/link";
import { Eye, MessageCircle, PenLine, Pin } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LikeButton } from "@/components/shop/LikeButton";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { UserAvatar } from "@/components/shop/UserAvatar";
import { getCategories, getPosts, togglePostLike } from "@/lib/api/community";
import { assetUrl } from "@/lib/utils/assetUrl";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useAuthStore } from "@/stores/authStore";
import type { CommunityPost, PagedResult } from "@/types";

export default function CommunityPage() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const queryKey = ["community-posts", category, sortBy];
  const { data: categories = [] } = useQuery({ queryKey: ["community-categories"], queryFn: getCategories });
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getPosts({ category: category === "All" ? undefined : category, page: 1, pageSize: 20, sortBy }),
  });
  const posts = data?.items ?? [];
  const tabs = useMemo(() => ["All", ...categories], [categories]);
  const likeMutation = useMutation({
    mutationFn: togglePostLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PagedResult<CommunityPost>>(queryKey);
      if (previous) {
        queryClient.setQueryData<PagedResult<CommunityPost>>(queryKey, {
          ...previous,
          items: previous.items.map((post) => post.id === postId ? {
            ...post,
            isLikedByMe: !post.isLikedByMe,
            likeCount: post.isLikedByMe ? Math.max(post.likeCount - 1, 0) : post.likeCount + 1,
          } : post),
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Community</h1>
            <p className="mt-2 text-sm text-zinc-400">Share drops, unboxings, outfits, and questions.</p>
          </div>
          {isAuthenticated ? (
            <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black" href="/community/new">
              <PenLine className="size-4" />
              發文
            </Link>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button key={item} className={`rounded-full border px-4 py-2 text-sm ${category === item ? "border-white bg-white text-black" : "border-white/10 text-zinc-300"}`} type="button" onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
          <select className="h-10 rounded-md border border-white/10 bg-[#141414] px-3 text-sm" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {isLoading ? <CommunitySkeleton /> : null}
          {!isLoading && posts.length === 0 ? <div className="rounded-md border border-white/10 bg-[#141414] p-10 text-center text-zinc-400">還沒有文章，來當第一個發文的人吧。</div> : null}
          {posts.map((post) => (
            <PostCard key={post.id} onLike={() => isAuthenticated ? likeMutation.mutate(post.id) : location.assign("/login")} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

function PostCard({ onLike, post }: Readonly<{ post: CommunityPost; onLike: () => void }>) {
  const authorLabel = post.authorDisplayName || post.authorName;

  return (
    <article className={`rounded-xl border bg-[#141414] p-5 transition hover:border-white/25 ${post.isPinned ? "border-l-white border-l-4 border-white/10" : "border-white/10"}`}>
      <div className="flex items-center justify-between gap-3">
        <Link className="flex min-w-0 items-center gap-3 rounded-md hover:opacity-85" href={`/user/${post.authorId}`}>
          <UserAvatar avatarUrl={post.authorAvatarUrl} name={authorLabel} />
          <div className="min-w-0">
            <p className="truncate text-sm text-white hover:underline">{authorLabel}</p>
            <p className="text-xs text-zinc-500">{relativeTime(post.createdAt)}</p>
          </div>
        </Link>
        {post.isPinned ? <Pin className="size-4 text-white" /> : null}
      </div>
      <Link className="block" href={`/community/${post.id}`}>
        <span className="mt-4 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{post.category}</span>
        <h2 className="mt-3 text-lg font-medium text-white">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{stripHtml(post.content)}</p>
        {post.imageUrl ? <img alt={post.title} className="mt-4 max-h-80 w-full rounded-md object-cover" src={assetUrl(post.imageUrl)} /> : null}
      </Link>
      <div className="mt-4 flex items-center gap-5 text-sm text-zinc-400">
        <LikeButton count={post.likeCount} isLiked={post.isLikedByMe} onToggle={onLike} />
        <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" />{post.commentCount}</span>
        <span className="inline-flex items-center gap-1.5"><Eye className="size-4" />{post.viewCount}</span>
      </div>
    </article>
  );
}

function CommunitySkeleton() {
  return Array.from({ length: 3 }).map((_, index) => <div className="h-48 shimmer rounded-xl border border-white/10" key={index} />);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}
