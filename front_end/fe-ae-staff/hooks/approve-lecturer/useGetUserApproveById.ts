"use client";

import { AdminService } from "@/services/approve-lecturer.services";
import type { AdminUserDetailResponse } from "@/types/approve-lecturer/approve-lecturer.response";
import { useCallback, useState } from "react";

export function useGetUserApproveById() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AdminUserDetailResponse | null>(null);

  const fetchUser = useCallback(async (userId?: string): Promise<AdminUserDetailResponse | null> => {
    if (!userId) return null;
    setLoading(true);
    try {
      const res = await AdminService.getUserById(userId);
      const payload = (res as any)?.data ?? res;
      setUser(payload ?? null);
      return payload ?? null;
    } catch (err) {
      console.error("useGetUserApproveById: failed to fetch user", err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, fetchUser };
}
