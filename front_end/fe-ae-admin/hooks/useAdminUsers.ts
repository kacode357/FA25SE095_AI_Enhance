// hooks/useAdminUsers.ts
"use client";

import { useState, useCallback } from "react";
import { AdminService } from "@/services/admin.services";
import { GetUsersParams } from "@/types/admin/admin.payload";
import {
  AdminGetUsersResponse,
  AdminUserDetailResponse,
  ReactivateUserResponse,
} from "@/types/admin/admin.response";

export function useAdminUsers() {
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingReactivate, setLoadingReactivate] = useState(false);

  const [listData, setListData] = useState<AdminGetUsersResponse | null>(null);
  const [detailData, setDetailData] = useState<AdminUserDetailResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  /** ==== Fetch list users ==== */
  const fetchUsers = useCallback(async (params?: GetUsersParams) => {
    try {
      setLoadingList(true);
      setError(null);
      const res = await AdminService.getUsers(params);
      setListData(res);
      return res;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to fetch users";
      setError(message);
      return null;
    } finally {
      setLoadingList(false);
    }
  }, []);

  /** ==== Fetch user detail ==== */
  const fetchUserDetail = useCallback(async (userId: string) => {
    try {
      setLoadingDetail(true);
      setError(null);
      const res = await AdminService.getUserById(userId);
      setDetailData(res);
      return res;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch user detail";
      setError(message);
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  /** ==== Reactivate user ==== */
  const reactivateUser = useCallback(async (userId: string): Promise<ReactivateUserResponse | null> => {
    try {
      setLoadingReactivate(true);
      setError(null);
      const res = await AdminService.reactivateUser(userId);
      // ✅ refresh list ngay sau khi thành công
      await fetchUsers({ page: listData?.page ?? 1, pageSize: listData?.pageSize ?? 10 });
      return res;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to reactivate user";
      setError(message);
      return null;
    } finally {
      setLoadingReactivate(false);
    }
  }, [fetchUsers, listData]);

  return {
    loadingList,
    loadingDetail,
    loadingReactivate,
    error,
    listData,
    detailData,
    fetchUsers,
    fetchUserDetail,
    reactivateUser,
  };
}
