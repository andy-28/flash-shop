import { apiClient } from "@/lib/api/client";
import type { MediaFile, MediaList } from "@/types";

export async function getMediaList(params?: { folder?: string; search?: string; page?: number; pageSize?: number }) {
  const response = await apiClient.get<MediaList>("/admin/media", { params });
  return response.data;
}

export async function getMediaFolders() {
  const response = await apiClient.get<string[]>("/admin/media/folders");
  return response.data;
}

export async function getMediaDetail(id: string) {
  const response = await apiClient.get<MediaFile>(`/admin/media/${id}`);
  return response.data;
}

export async function uploadMedia(file: File, folder?: string, altText?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);
  if (altText) formData.append("altText", altText);

  const response = await apiClient.post<MediaFile>("/admin/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateMedia(id: string, payload: { altText?: string | null; folder?: string | null }) {
  const response = await apiClient.put<MediaFile>(`/admin/media/${id}`, payload);
  return response.data;
}

export async function deleteMedia(id: string, force = false) {
  await apiClient.delete(`/admin/media/${id}`, { params: { force } });
}

export async function bulkDeleteMedia(ids: string[], force = false) {
  await apiClient.post("/admin/media/bulk-delete", { ids, force });
}
