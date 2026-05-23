import { apiClient } from "@/lib/api/client";
import type { ContentBlock, ContentBlockPayload } from "@/types";

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
