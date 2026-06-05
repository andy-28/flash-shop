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
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <section className="mx-auto max-w-4xl px-4 py-10">
        {isLoading ? <div className="h-64 animate-pulse rounded-xl bg-[#141414]" /> : null}
        {profile ? (
          <>
            <header className="rounded-xl border border-white/10 bg-[#141414] p-6 text-center">
              <div className="flex justify-center">
                <UserAvatar avatarUrl={profile.avatarUrl} name={displayName} size={96} />
              </div>
              <h1 className="mt-4 text-2xl font-semibold">{displayName}</h1>
              {profile.bio ? <p className="mx-auto mt-3 max-w-xl whitespace-pre-wrap text-sm leading-6 text-zinc-400">{profile.bio}</p> : null}
              <p className="mt-3 text-xs text-zinc-500">Joined {formatDate(profile.createdAt)}</p>
              <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
                <StatCard icon={FileText} label="Posts" value={profile.communityPosts.toString()} />
                <StatCard icon={Heart} label="Likes" value={profile.communityLikes.toString()} />
              </div>
            </header>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">{displayName}&apos;s posts</h2>
              <div className="mt-4 grid gap-3">
                {(posts?.items ?? []).map((post) => (
                  <Link className="rounded-md border border-white/10 bg-[#141414] p-4 hover:border-white/25" href={`/community/${post.id}`} key={post.id}>
                    <p className="text-sm text-zinc-500">{post.category} · {relativeTime(post.createdAt)}</p>
                    <h3 className="mt-2 font-medium">{post.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{post.likeCount} likes · {post.commentCount} comments · {post.viewCount} views</p>
                  </Link>
                ))}
                {posts && posts.items.length === 0 ? <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">No public posts yet.</div> : null}
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
    <div className="rounded-lg border border-white/10 bg-black p-4">
      <Icon className="mx-auto size-4 text-zinc-400" />
      <p className="mt-3 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
