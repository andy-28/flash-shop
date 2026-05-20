import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const rawState = window.localStorage.getItem("flashshop-auth");
      token = rawState ? JSON.parse(rawState)?.state?.accessToken : null;
    } catch {
      token = null;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
