import { apiClient } from "@/lib/api/client";
import type { AdminCommunityPost, CommunityComment, CommunityPost, CommunityPostDetail, PagedResult } from "@/types";

export async function getPosts(params?: { category?: string; page?: number; pageSize?: number; sortBy?: string }) {
  const response = await apiClient.get<PagedResult<CommunityPost>>("/community/posts", { params });
  return response.data;
}

export async function getPostDetail(id: string) {
  const response = await apiClient.get<CommunityPostDetail>(`/community/posts/${id}`);
  return response.data;
}

export async function createPost(data: { title: string; content: string; category: string; imageUrl?: string | null }) {
  const response = await apiClient.post<CommunityPost>("/community/posts", data);
  return response.data;
}

export async function updatePost(id: string, data: { title: string; content: string; category: string; imageUrl?: string | null }) {
  const response = await apiClient.put<CommunityPost>(`/community/posts/${id}`, data);
  return response.data;
}

export async function deletePost(id: string) {
  await apiClient.delete(`/community/posts/${id}`);
}

export async function togglePostLike(id: string) {
  const response = await apiClient.post<{ isLiked: boolean; likeCount: number }>(`/community/posts/${id}/like`);
  return response.data;
}

export async function getCategories() {
  const response = await apiClient.get<string[]>("/community/categories");
  return response.data;
}

export async function createComment(postId: string, data: { content: string; parentCommentId?: string | null }) {
  const response = await apiClient.post<CommunityComment>(`/community/posts/${postId}/comments`, data);
  return response.data;
}

export async function deleteComment(id: string) {
  await apiClient.delete(`/community/comments/${id}`);
}

export async function toggleCommentLike(id: string) {
  const response = await apiClient.post<{ isLiked: boolean; likeCount: number }>(`/community/comments/${id}/like`);
  return response.data;
}

export async function getAdminCommunityPosts() {
  const response = await apiClient.get<AdminCommunityPost[]>("/admin/community/posts");
  return response.data;
}

export async function toggleAdminPostPin(id: string) {
  const response = await apiClient.post<{ isPinned: boolean }>(`/admin/community/posts/${id}/pin`);
  return response.data;
}

export async function hideAdminPost(id: string) {
  await apiClient.delete(`/admin/community/posts/${id}`);
}
