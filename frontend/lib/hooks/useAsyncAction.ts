"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/admin/Toast";

interface UseAsyncActionOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useAsyncAction(action: () => Promise<void>, options?: UseAsyncActionOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const execute = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await action();
      if (options?.successMessage) toast.success(options.successMessage);
      options?.onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, options?.errorMessage ?? "操作失敗，請稍後再試。"));
      options?.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [action, isLoading, options, toast]);

  return { execute, isLoading };
}
