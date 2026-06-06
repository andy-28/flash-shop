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
        <Link className="rounded-md border border-border-default bg-bg-secondary p-4 transition hover:border-border-hover" href={`/community/${post.id}`} key={post.id}>
          <div className="flex items-center gap-3">
            <UserAvatar avatarUrl={post.authorAvatarUrl} name={post.authorDisplayName || post.authorName} />
            <div className="min-w-0">
              <p className="truncate text-sm text-text-primary">{post.authorDisplayName || post.authorName}</p>
              <p className="text-xs text-text-tertiary">{relativeTime(post.createdAt)}</p>
            </div>
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-medium text-text-primary">{post.title}</h3>
          <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
            <LikeButton count={post.likeCount} isLiked={post.isLikedByMe} onToggle={() => undefined} size="sm" />
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" />{post.commentCount}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
