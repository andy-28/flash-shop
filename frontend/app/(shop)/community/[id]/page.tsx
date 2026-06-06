"use client";

import Link from "next/link";
import { Eye, Loader2, MessageCircle, Pin, Send, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { RichTextDisplay } from "@/components/shop/RichTextDisplay";
import { LikeButton } from "@/components/shop/LikeButton";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { UserAvatar } from "@/components/shop/UserAvatar";
import { createComment, deletePost, getPostDetail, toggleCommentLike, togglePostLike } from "@/lib/api/community";
import { assetUrl } from "@/lib/utils/assetUrl";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useAuthStore } from "@/stores/authStore";
import type { CommunityComment, CommunityPostDetail } from "@/types";

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [comment, setComment] = useState("");
  const { data: post, isLoading } = useQuery({ queryKey: ["community-post", postId], queryFn: () => getPostDetail(postId) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["community-post", postId] });

  const likeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["community-post", postId] });
      const previous = queryClient.getQueryData<CommunityPostDetail>(["community-post", postId]);
      if (previous) {
        queryClient.setQueryData<CommunityPostDetail>(["community-post", postId], {
          ...previous,
          isLikedByMe: !previous.isLikedByMe,
          likeCount: previous.isLikedByMe ? Math.max(previous.likeCount - 1, 0) : previous.likeCount + 1,
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["community-post", postId], context.previous);
      toast.error("按讚失敗，請稍後再試。");
    },
    onSettled: invalidate,
  });

  const commentMutation = useMutation({
    mutationFn: (payload: { content: string; parentCommentId?: string | null }) => createComment(postId, payload),
    onSuccess: async () => {
      setComment("");
      toast.success("留言已送出");
      await invalidate();
    },
    onError: () => toast.error("留言送出失敗"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      toast.success("文章已刪除");
      router.push("/community");
    },
    onError: () => toast.error("刪除文章失敗"),
  });

  const commentLikeMutation = useMutation({
    mutationFn: toggleCommentLike,
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["community-post", postId] });
      const previous = queryClient.getQueryData<CommunityPostDetail>(["community-post", postId]);
      if (previous) {
        queryClient.setQueryData<CommunityPostDetail>(["community-post", postId], updateCommentLike(previous, commentId));
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["community-post", postId], context.previous);
      toast.error("按讚失敗，請稍後再試。");
    },
    onSettled: invalidate,
  });

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ShopNavbar />
      <section className="mx-auto max-w-3xl px-4 py-10">
        {isLoading ? <div className="h-96 shimmer rounded-xl" /> : null}
        {post ? (
          <>
            <article className="rounded-xl border border-white/10 bg-[#141414] p-5">
              <div className="flex items-center justify-between gap-3">
                <Link className="flex min-w-0 items-center gap-3 hover:opacity-85" href={`/user/${post.authorId}`}>
                  <UserAvatar avatarUrl={post.authorAvatarUrl} name={post.authorDisplayName || post.authorName} />
                  <div>
                    <p className="text-sm text-white hover:underline">{post.authorDisplayName || post.authorName}</p>
                    <p className="text-xs text-zinc-500">{relativeTime(post.createdAt)}</p>
                  </div>
                </Link>
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
                  <button className="ml-auto inline-flex items-center gap-1.5 text-[#EF4444] disabled:opacity-50" type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                    {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    Delete
                  </button>
                ) : null}
              </div>
            </article>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">留言 ({post.commentCount})</h2>
              {isAuthenticated ? (
                <div className="mt-4 flex gap-3">
                  <input className="h-11 flex-1 rounded-md border border-white/10 bg-[#141414] px-3 text-sm outline-none disabled:opacity-60" placeholder="Write a comment..." value={comment} disabled={commentMutation.isPending} onChange={(event) => setComment(event.target.value)} />
                  <button className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-50" disabled={!comment.trim() || commentMutation.isPending} type="button" onClick={() => commentMutation.mutate({ content: comment })}>
                    {commentMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {commentMutation.isPending ? "送出中..." : "送出"}
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-400">登入後即可留言。</p>
              )}
              <div className="mt-5 grid gap-4">
                {post.comments.map((item) => (
                  <CommentThread
                    key={item.id}
                    comment={item}
                    isAuthenticated={isAuthenticated}
                    isReplying={commentMutation.isPending}
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

function updateCommentLike(post: CommunityPostDetail, commentId: string): CommunityPostDetail {
  const toggle = (comment: CommunityComment): CommunityComment => {
    if (comment.id === commentId) {
      return {
        ...comment,
        isLikedByMe: !comment.isLikedByMe,
        likeCount: comment.isLikedByMe ? Math.max(comment.likeCount - 1, 0) : comment.likeCount + 1,
      };
    }

    return { ...comment, replies: comment.replies.map(toggle) };
  };

  return { ...post, comments: post.comments.map(toggle) };
}

function CommentThread({ comment, isAuthenticated, isReplying, onLike, onReply }: Readonly<{ comment: CommunityComment; isAuthenticated: boolean; isReplying: boolean; onLike: (id: string) => void; onReply: (id: string, content: string) => void }>) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  return (
    <div className="rounded-md border border-white/10 bg-[#141414] p-4">
      <CommentBody comment={comment} onLike={onLike} onReply={() => setReplyOpen((value) => !value)} />
      {replyOpen && isAuthenticated ? (
        <div className="mt-3 flex gap-2 pl-11">
          <input className="h-10 flex-1 rounded-md border border-white/10 bg-black px-3 text-sm outline-none disabled:opacity-60" placeholder="Reply..." value={reply} disabled={isReplying} onChange={(event) => setReply(event.target.value)} />
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 text-sm text-black disabled:opacity-60" disabled={!reply.trim() || isReplying} type="button" onClick={() => { if (reply.trim()) { onReply(comment.id, reply); setReply(""); setReplyOpen(false); } }}>
            {isReplying ? <Loader2 className="size-4 animate-spin" /> : null}
            Send
          </button>
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
  const authorLabel = comment.authorDisplayName || comment.authorName;

  return (
    <div className="flex gap-3">
      <Link href={`/user/${comment.authorId}`}>
        <UserAvatar avatarUrl={comment.authorAvatarUrl} name={authorLabel} size={32} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link className="text-sm text-white hover:underline" href={`/user/${comment.authorId}`}>{authorLabel}</Link>
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
