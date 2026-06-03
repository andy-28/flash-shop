import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { LikeButton } from "@/components/shop/LikeButton";
import { UserAvatar } from "@/components/shop/UserAvatar";
import type { CommunityPost } from "@/types";
import { relativeTime } from "@/lib/utils/relativeTime";

export function CommunityPreview({ posts }: Readonly<{ posts: CommunityPost[] }>) {
  if (!posts.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <Link className="rounded-md border border-white/10 bg-[#141414] p-4 transition hover:border-white/25" href={`/community/${post.id}`} key={post.id}>
          <div className="flex items-center gap-3">
            <UserAvatar avatarUrl={post.authorAvatarUrl} name={post.authorName} />
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{post.authorName}</p>
              <p className="text-xs text-zinc-500">{relativeTime(post.createdAt)}</p>
            </div>
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-medium text-white">{post.title}</h3>
          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
            <LikeButton count={post.likeCount} isLiked={post.isLikedByMe} onToggle={() => undefined} size="sm" />
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" />{post.commentCount}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
