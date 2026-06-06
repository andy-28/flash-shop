"use client";

import Link from "next/link";
import { Camera, FileText, Heart, ReceiptText, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { UserAvatar } from "@/components/shop/UserAvatar";
import { getMyProfile, getUserPosts } from "@/lib/api/profile";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useAuthStore } from "@/stores/authStore";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const syncProfile = useAuthStore((state) => state.updateProfile);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: hasHydrated && isAuthenticated,
  });
  const { data: posts } = useQuery({
    queryKey: ["my-profile-posts", profile?.id],
    queryFn: () => getUserPosts(profile!.id, { pageSize: 6 }),
    enabled: Boolean(profile?.id),
  });

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatarUrl ?? null);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async () => {
      await syncProfile({ displayName: displayName || null, bio: bio || null, avatarUrl });
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (hasHydrated && !isAuthenticated) {
    return (
      <main className="min-h-screen bg-bg-primary text-text-primary">
        <ShopNavbar />
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Please log in</h1>
          <p className="mt-2 text-sm text-text-secondary">You need an account to edit your profile.</p>
          <Link className="mt-5 inline-flex rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-accent-primary-text" href="/login">Login</Link>
        </section>
      </main>
    );
  }

  const name = displayName || profile?.name || "User";

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <ShopNavbar />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-border-default bg-bg-secondary p-6">
          {isLoading ? <div className="h-72 shimmer rounded-lg" /> : null}
          {profile ? (
            <>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="w-full md:w-44">
                  <div className="group relative mx-auto size-32 overflow-hidden rounded-full border-2 border-border-default">
                    <UserAvatar avatarUrl={avatarUrl} name={name} size={128} />
                    <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/55 group-hover:opacity-100">
                      <Camera className="size-6" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <MediaPicker folder="avatars" value={avatarUrl} placeholder="Choose avatar" onChange={(url) => setAvatarUrl(url || null)} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <label className="text-sm text-text-secondary">Display name</label>
                    <input className="mt-2 h-11 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" maxLength={50} value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Bio</label>
                    <textarea className="mt-2 min-h-28 w-full rounded-md border border-border-default bg-bg-primary p-3 text-sm outline-none" maxLength={500} value={bio} onChange={(event) => setBio(event.target.value)} />
                    <p className="mt-1 text-xs text-text-tertiary">{bio.length}/500</p>
                  </div>
                  <div className="grid gap-2 text-sm text-text-secondary">
                    <p>Email: <span className="text-text-secondary">{profile.email}</span></p>
                    <p>Joined: <span className="text-text-secondary">{formatDate(profile.createdAt)}</span></p>
                  </div>
                  <LoadingButton isLoading={mutation.isPending} loadingText="Saving..." onClick={() => mutation.mutate()}>
                    Save profile
                  </LoadingButton>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {profile?.stats ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ReceiptText} label="Orders" value={profile.stats.totalOrders.toString()} />
            <StatCard icon={Wallet} label="Total spent" value={formatCurrency(profile.stats.totalSpent)} />
            <StatCard icon={FileText} label="Posts" value={profile.stats.communityPosts.toString()} />
            <StatCard icon={Heart} label="Likes received" value={profile.stats.communityLikes.toString()} />
          </section>
        ) : null}

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My posts</h2>
            <Link className="text-sm text-text-secondary hover:text-text-primary" href="/community/new">New post</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {(posts?.items ?? []).map((post) => (
              <Link className="rounded-md border border-border-default bg-bg-secondary p-4 hover:border-border-hover" href={`/community/${post.id}`} key={post.id}>
                <p className="text-sm text-text-tertiary">{post.category} · {relativeTime(post.createdAt)}</p>
                <h3 className="mt-2 font-medium">{post.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{post.likeCount} likes · {post.commentCount} comments</p>
              </Link>
            ))}
            {posts && posts.items.length === 0 ? <div className="rounded-md border border-dashed border-border-default p-8 text-center text-sm text-text-tertiary">No posts yet.</div> : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }: Readonly<{ icon: typeof ReceiptText; label: string; value: string }>) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
      <Icon className="size-4 text-text-secondary" />
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-text-tertiary">{label}</p>
    </div>
  );
}
