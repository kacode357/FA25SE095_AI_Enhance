"use client";

import { useCallback, useState } from "react";

import { LecturerService } from "@/services/lecturer.services";
import type { GetLecturersQuery } from "@/types/lecturers/lecturer.payload";
import type {
  GetLecturersResponse,
  LecturerItem,
} from "@/types/lecturers/lecturer.response";

const cache = new Map<string, GetLecturersResponse>();

export function useLecturers() {
  const [listData, setListData] = useState<LecturerItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); 
  const [loading, setLoading] = useState(false);

  const fetchLecturers = useCallback(
    async (params: GetLecturersQuery, force = false) => {
      // ép pageSize = 5 nếu không truyền
      const finalParams: GetLecturersQuery = {
        ...params,
        page: params.page ?? currentPage,
        pageSize: params.pageSize ?? 5,
      };

      const key = JSON.stringify(finalParams);
      if (!force && cache.has(key)) {
        const cached = cache.get(key)!;
        const data = cached.data;

        setListData(data.items || []);
        setTotalCount(data.totalItems);
        setCurrentPage(data.page);
        setPageSize(data.pageSize);
        return cached;
      }

      setLoading(true);
      try {
        const res = await LecturerService.getLecturers(finalParams);
        cache.set(key, res);

        const data = res.data;

        setListData(data.items || []);
        setTotalCount(data.totalItems);
        setCurrentPage(data.page);
        setPageSize(data.pageSize);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  const refetch = (params: GetLecturersQuery) => fetchLecturers(params, true);

  return {
    listData,     // LecturerItem[]
    totalCount,   // tổng lecturer (trong toàn bộ dataset)
    currentPage,  // trang hiện tại
    pageSize,     // mặc định 5
    loading,
    fetchLecturers,
    refetch,
  };
}
