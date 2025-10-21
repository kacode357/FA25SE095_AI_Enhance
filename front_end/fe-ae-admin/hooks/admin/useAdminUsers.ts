// hooks/admin/useAdminUsers.ts
"use client";

import { useState, useCallback } from "react";
import { AdminService } from "@/services/admin.services";
import type { GetUsersParams } from "@/types/admin/admin.payload";
import type {
  AdminGetUsersResponse,
  AdminUserDetailResponse,
  ReactivateUserResponse,
} from "@/types/admin/admin.response";

export function useAdminUsers() {
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingReactivate, setLoadingReactivate] = useState(false);

  const [listData, setListData] = useState<AdminGetUsersResponse | null>(null);
  const [detailData, setDetailData] = useState<AdminUserDetailResponse | null>(null);

  /** Fetch list users (bubble error lên trên, không catch ở đây) */
  const fetchUsers = useCallback(
    async (params?: GetUsersParams): Promise<AdminGetUsersResponse> => {
      setLoadingList(true);
      try {
        const res = await AdminService.getUsers(params);
        setListData(res);
        return res;
      } finally {
        setLoadingList(false);
      }
    },
    []
  );

  /** Fetch user detail */
  const fetchUserDetail = useCallback(
    async (userId: string): Promise<AdminUserDetailResponse> => {
      setLoadingDetail(true);
      try {
        const res = await AdminService.getUserById(userId);
        setDetailData(res);
        return res;
      } finally {
        setLoadingDetail(false);
      }
    },
    []
  );

  /** Reactivate user → xong thì reload list theo trang hiện tại */
  const reactivateUser = useCallback(
    async (userId: string): Promise<ReactivateUserResponse> => {
      setLoadingReactivate(true);
      try {
        const res = await AdminService.reactivateUser(userId);
        await fetchUsers({
          page: listData?.page ?? 1,
          pageSize: listData?.pageSize ?? 10,
        });
        return res;
      } finally {
        setLoadingReactivate(false);
      }
    },
    [fetchUsers, listData?.page, listData?.pageSize]
  );

  return {
    loadingList,
    loadingDetail,
    loadingReactivate,
    listData,
    detailData,
    fetchUsers,
    fetchUserDetail,
    reactivateUser,
  };
}
