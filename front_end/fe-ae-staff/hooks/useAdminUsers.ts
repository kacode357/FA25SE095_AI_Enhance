// hooks/useStaffUsers.ts (renamed from useAdminUsers)
"use client";

import { useCallback, useState } from "react";
// TODO: Replace AdminService with StaffService when backend ready

import { AdminService } from '../../fe-ae-admin/services/admin.services';
import { AdminGetUsersResponse, AdminUserDetailResponse } from '../../fe-ae-admin/types/admin/admin.response';
import { GetUsersParams } from "../types/staff/user.payload";
import { ReactivateUserResponse } from "../types/staff/user.response";

export function useStaffUsers() {
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
  const res = await AdminService.getUsers(params); // placeholder
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
  const res = await AdminService.getUserById(userId); // placeholder
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
  const res = await AdminService.reactivateUser(userId); // placeholder
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
