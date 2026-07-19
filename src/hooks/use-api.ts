"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

/**
 * 通用 API 调用 Hook
 * 封装 loading / error / toast 反馈
 */
export function useApi<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          ...options,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }
        return data as T;
      } catch (err: any) {
        const msg = err.message || "Something went wrong";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { call, loading, error };
}
