import axios from "axios";

interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  traceId?: string;
}

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

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope | undefined;
    if (body && typeof body.success === "boolean") {
      if (!body.success) {
        return Promise.reject({
          response: {
            status: response.status,
            data: body,
          },
        });
      }

      response.data = body.data;
    }

    return response;
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("flashshop-auth");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
