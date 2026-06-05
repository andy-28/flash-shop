import { apiClient } from "@/lib/api/client";
import type { CommunityPost, PagedResult, PublicUserProfile, UserProfile } from "@/types";

export async function getMyProfile() {
  const response = await apiClient.get<UserProfile>("/profile");
  return response.data;
}

export async function updateProfile(data: { displayName?: string | null; bio?: string | null; avatarUrl?: string | null }) {
  const response = await apiClient.put<UserProfile>("/profile", data);
  return response.data;
}

export async function getPublicProfile(userId: string) {
  const response = await apiClient.get<PublicUserProfile>(`/users/${userId}`);
  return response.data;
}

export async function getUserPosts(userId: string, params?: { page?: number; pageSize?: number }) {
  const response = await apiClient.get<PagedResult<CommunityPost>>(`/users/${userId}/posts`, { params });
  return response.data;
}
