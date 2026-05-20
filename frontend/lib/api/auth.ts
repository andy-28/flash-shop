import { apiClient } from "./client";
import type { AuthUser, LoginResponse } from "@/types";

export async function login(payload: { email: string; password: string }) {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: { email: string; password: string; name: string }) {
  const response = await apiClient.post<LoginResponse>("/auth/register", payload);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}
