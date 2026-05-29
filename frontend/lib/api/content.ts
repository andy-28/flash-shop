import { apiClient } from "@/lib/api/client";
import type { ContentBlock, ContentBlockPayload, ContentVersion } from "@/types";

export async function getContentByPlacement(placement: string) {
  const response = await apiClient.get<ContentBlock[]>("/content", { params: { placement } });
  return response.data;
}

export async function getAdminContentList(placement?: string) {
  const response = await apiClient.get<ContentBlock[]>("/admin/content", {
    params: placement && placement !== "All" ? { placement } : undefined,
  });
  return response.data;
}

export async function createContentBlock(payload: ContentBlockPayload) {
  const response = await apiClient.post<ContentBlock>("/admin/content", payload);
  return response.data;
}

export async function updateContentBlock(id: string, payload: ContentBlockPayload) {
  const response = await apiClient.put<ContentBlock>(`/admin/content/${id}`, payload);
  return response.data;
}

export async function deleteContentBlock(id: string) {
  await apiClient.delete(`/admin/content/${id}`);
}

export async function toggleContentBlock(id: string) {
  const response = await apiClient.patch<ContentBlock>(`/admin/content/${id}/toggle`);
  return response.data;
}

export async function publishContentBlock(id: string) {
  const response = await apiClient.post<ContentBlock>(`/admin/content/${id}/publish`);
  return response.data;
}

export async function unpublishContentBlock(id: string) {
  const response = await apiClient.post<ContentBlock>(`/admin/content/${id}/unpublish`);
  return response.data;
}

export async function archiveContentBlock(id: string) {
  const response = await apiClient.post<ContentBlock>(`/admin/content/${id}/archive`);
  return response.data;
}

export async function getContentVersions(id: string) {
  const response = await apiClient.get<ContentVersion[]>(`/admin/content/${id}/versions`);
  return response.data;
}

export async function restoreContentVersion(id: string, versionId: string) {
  const response = await apiClient.post<ContentBlock>(`/admin/content/${id}/restore`, { versionId });
  return response.data;
}

export async function previewContentBlock(id: string) {
  const response = await apiClient.get<ContentBlock>(`/admin/content/${id}/preview`);
  return response.data;
}

export async function reorderContentBlocks(placement: string, orderedIds: string[]) {
  await apiClient.put("/admin/content/reorder", { placement, orderedIds });
}

export async function uploadContentImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<{ url: string }>("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.url;
}
