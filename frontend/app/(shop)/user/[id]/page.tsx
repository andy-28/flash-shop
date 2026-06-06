"use client";

import Link from "next/link";
import { FileText, Heart } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { UserAvatar } from "@/components/shop/UserAvatar";
import { getPublicProfile, getUserPosts } from "@/lib/api/profile";
import { formatDate } from "@/lib/utils/formatDate";
import { relativeTime } from "@/lib/utils/relativeTime";

export default function PublicUserProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { data: profile, isLoading } = useQuery({ queryKey: ["public-profile", userId], queryFn: () => getPublicProfile(userId) });
  const { data: posts } = useQuery({ queryKey: ["public-profile-posts", userId], queryFn: () => getUserPosts(userId, { pageSize: 12 }) });

  const displayName = profile?.displayName || profile?.name || "User";

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <ShopNavbar />
      <section className="mx-auto max-w-4xl px-4 py-10">
        {isLoading ? <div className="h-64 shimmer rounded-xl" /> : null}
        {profile ? (
          <>
            <header className="rounded-xl border border-border-default bg-bg-secondary p-6 text-center">
              <div className="flex justify-center">
                <UserAvatar avatarUrl={profile.avatarUrl} name={displayName} size={96} />
              </div>
              <h1 className="mt-4 text-2xl font-semibold">{displayName}</h1>
              {profile.bio ? <p className="mx-auto mt-3 max-w-xl whitespace-pre-wrap text-sm leading-6 text-text-secondary">{profile.bio}</p> : null}
              <p className="mt-3 text-xs text-text-tertiary">Joined {formatDate(profile.createdAt)}</p>
              <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
                <StatCard icon={FileText} label="Posts" value={profile.communityPosts.toString()} />
                <StatCard icon={Heart} label="Likes" value={profile.communityLikes.toString()} />
              </div>
            </header>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">{displayName}&apos;s posts</h2>
              <div className="mt-4 grid gap-3">
                {(posts?.items ?? []).map((post) => (
                  <Link className="rounded-md border border-border-default bg-bg-secondary p-4 hover:border-border-hover" href={`/community/${post.id}`} key={post.id}>
                    <p className="text-sm text-text-tertiary">{post.category} · {relativeTime(post.createdAt)}</p>
                    <h3 className="mt-2 font-medium">{post.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{post.likeCount} likes · {post.commentCount} comments · {post.viewCount} views</p>
                  </Link>
                ))}
                {posts && posts.items.length === 0 ? <div className="rounded-md border border-dashed border-border-default p-8 text-center text-sm text-text-tertiary">No public posts yet.</div> : null}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }: Readonly<{ icon: typeof FileText; label: string; value: string }>) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-primary p-4">
      <Icon className="mx-auto size-4 text-text-secondary" />
      <p className="mt-3 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-text-tertiary">{label}</p>
    </div>
  );
}
