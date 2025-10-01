"use client";
import { useCallback, useState } from "react";
import { StaffService } from "../services/staff.service";
import { GetUsersParams } from "../types/staff/user.payload";
import { ReactivateUserResponse, StaffGetUsersResponse, StaffUserDetailResponse } from "../types/staff/user.response";

export function useStaffUsers() {
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingReactivate, setLoadingReactivate] = useState(false);
  const [listData, setListData] = useState<StaffGetUsersResponse | null>(null);
  const [detailData, setDetailData] = useState<StaffUserDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params?: GetUsersParams) => {
    try {
      setLoadingList(true); setError(null);
      const res = await StaffService.getUsers(params);
      setListData(res); return res;
    } catch (e:any){ setError(e?.message||'Failed to load users'); return null; }
    finally { setLoadingList(false); }
  }, []);

  const fetchUserDetail = useCallback(async (userId: string) => {
    try { setLoadingDetail(true); setError(null);
      const res = await StaffService.getUserById(userId);
      setDetailData(res); return res;
    } catch(e:any){ setError(e?.message||'Failed to load user'); return null; }
    finally { setLoadingDetail(false); }
  }, []);

  const reactivateUser = useCallback(async (userId: string): Promise<ReactivateUserResponse | null> => {
    try { setLoadingReactivate(true); setError(null);
      const res = await StaffService.reactivateUser(userId);
      await fetchUsers({ page: listData?.page ?? 1, pageSize: listData?.pageSize ?? 10 });
      return res;
    } catch(e:any){ setError(e?.message||'Failed to reactivate user'); return null; }
    finally { setLoadingReactivate(false); }
  }, [fetchUsers, listData]);

  return { loadingList, loadingDetail, loadingReactivate, error, listData, detailData, fetchUsers, fetchUserDetail, reactivateUser };
}
