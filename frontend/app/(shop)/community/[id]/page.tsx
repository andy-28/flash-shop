"use client";

import { Eye, MessageCircle, Pin, Send, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RichTextDisplay } from "@/components/shop/RichTextDisplay";
import { LikeButton } from "@/components/shop/LikeButton";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { UserAvatar } from "@/components/shop/UserAvatar";
import { createComment, deletePost, getPostDetail, toggleCommentLike, togglePostLike } from "@/lib/api/community";
import { assetUrl } from "@/lib/utils/assetUrl";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useAuthStore } from "@/stores/authStore";
import type { CommunityComment } from "@/types";

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [comment, setComment] = useState("");
  const { data: post, isLoading } = useQuery({ queryKey: ["community-post", postId], queryFn: () => getPostDetail(postId) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["community-post", postId] });
  const likeMutation = useMutation({ mutationFn: () => togglePostLike(postId), onSuccess: invalidate });
  const commentMutation = useMutation({
    mutationFn: (payload: { content: string; parentCommentId?: string | null }) => createComment(postId, payload),
    onSuccess: async () => { setComment(""); await invalidate(); },
  });
  const deleteMutation = useMutation({ mutationFn: () => deletePost(postId), onSuccess: () => router.push("/community") });
  const commentLikeMutation = useMutation({ mutationFn: toggleCommentLike, onSuccess: invalidate });

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <section className="mx-auto max-w-3xl px-4 py-10">
        {isLoading ? <div className="h-96 animate-pulse rounded-xl bg-[#141414]" /> : null}
        {post ? (
          <>
            <article className="rounded-xl border border-white/10 bg-[#141414] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar avatarUrl={post.authorAvatarUrl} name={post.authorName} />
                  <div>
                    <p className="text-sm text-white">{post.authorName}</p>
                    <p className="text-xs text-zinc-500">{relativeTime(post.createdAt)}</p>
                  </div>
                </div>
                {post.isPinned ? <Pin className="size-4" /> : null}
              </div>
              <span className="mt-5 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{post.category}</span>
              <h1 className="mt-4 text-3xl font-semibold">{post.title}</h1>
              <div className="mt-5"><RichTextDisplay html={post.content} /></div>
              {post.imageUrl ? <img alt={post.title} className="mt-5 max-h-[520px] w-full rounded-md object-cover" src={assetUrl(post.imageUrl)} /> : null}
              <div className="mt-6 flex items-center gap-5 border-t border-white/10 pt-4 text-sm text-zinc-400">
                <LikeButton count={post.likeCount} isLiked={post.isLikedByMe} onToggle={() => isAuthenticated ? likeMutation.mutate() : router.push("/login")} />
                <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" />{post.commentCount}</span>
                <span className="inline-flex items-center gap-1.5"><Eye className="size-4" />{post.viewCount}</span>
                {(user?.id === post.authorId || user?.role === "Admin") ? (
                  <button className="ml-auto inline-flex items-center gap-1.5 text-[#EF4444]" type="button" onClick={() => deleteMutation.mutate()}>
                    <Trash2 className="size-4" />Delete
                  </button>
                ) : null}
              </div>
            </article>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">留言 ({post.commentCount})</h2>
              {isAuthenticated ? (
                <div className="mt-4 flex gap-3">
                  <input className="h-11 flex-1 rounded-md border border-white/10 bg-[#141414] px-3 text-sm outline-none" placeholder="Write a comment..." value={comment} onChange={(event) => setComment(event.target.value)} />
                  <button className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-50" disabled={!comment.trim() || commentMutation.isPending} type="button" onClick={() => commentMutation.mutate({ content: comment })}>
                    <Send className="size-4" />Send
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-400">登入後可以留言。</p>
              )}
              <div className="mt-5 grid gap-4">
                {post.comments.map((item) => (
                  <CommentThread
                    key={item.id}
                    comment={item}
                    isAuthenticated={isAuthenticated}
                    onLike={(commentId) => isAuthenticated ? commentLikeMutation.mutate(commentId) : router.push("/login")}
                    onReply={(parentCommentId, content) => commentMutation.mutate({ parentCommentId, content })}
                  />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

function CommentThread({ comment, isAuthenticated, onLike, onReply }: Readonly<{ comment: CommunityComment; isAuthenticated: boolean; onLike: (id: string) => void; onReply: (id: string, content: string) => void }>) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  return (
    <div className="rounded-md border border-white/10 bg-[#141414] p-4">
      <CommentBody comment={comment} onLike={onLike} onReply={() => setReplyOpen((value) => !value)} />
      {replyOpen && isAuthenticated ? (
        <div className="mt-3 flex gap-2 pl-11">
          <input className="h-10 flex-1 rounded-md border border-white/10 bg-black px-3 text-sm outline-none" placeholder="Reply..." value={reply} onChange={(event) => setReply(event.target.value)} />
          <button className="rounded-md bg-white px-3 text-sm text-black" type="button" onClick={() => { if (reply.trim()) { onReply(comment.id, reply); setReply(""); setReplyOpen(false); } }}>Send</button>
        </div>
      ) : null}
      {comment.replies.length > 0 ? (
        <div className="mt-4 grid gap-3 border-l border-white/10 pl-6">
          {comment.replies.map((replyItem) => <CommentBody comment={replyItem} key={replyItem.id} onLike={onLike} />)}
        </div>
      ) : null}
    </div>
  );
}

function CommentBody({ comment, onLike, onReply }: Readonly<{ comment: CommunityComment; onLike: (id: string) => void; onReply?: () => void }>) {
  return (
    <div className="flex gap-3">
      <UserAvatar avatarUrl={comment.authorAvatarUrl} name={comment.authorName} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-white">{comment.authorName}</p>
          <span className="text-xs text-zinc-500">{relativeTime(comment.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{comment.content}</p>
        <div className="mt-2 flex gap-4">
          <LikeButton count={comment.likeCount} isLiked={comment.isLikedByMe} onToggle={() => onLike(comment.id)} size="sm" />
          {onReply ? <button className="text-sm text-zinc-500 hover:text-white" type="button" onClick={onReply}>Reply</button> : null}
        </div>
      </div>
    </div>
  );
}
