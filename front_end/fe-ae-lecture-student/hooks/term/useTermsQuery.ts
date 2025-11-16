// hooks/term/useTermsQuery.ts
"use client";

import { useCallback, useState } from "react";
import { TermService } from "@/services/term.services";
import type {
  GetTermsDropdownPayload,
} from "@/types/term/term.payload";
import type {
  GetTermsDropdownResponse,
  TermResponse,
} from "@/types/term/term.response";

type TermMeta = Pick<
  GetTermsDropdownResponse,
  | "totalCount"
  | "page"
  | "pageSize"
  | "totalPages"
  | "hasPreviousPage"
  | "hasNextPage"
>;

const DEFAULT_PARAMS: GetTermsDropdownPayload = {
  page: 1,
  pageSize: 10,
  sortBy: "Name",
  sortDirection: "asc",
};

const EMPTY_META: TermMeta = {
  totalCount: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function useTermsQuery(initialParams?: GetTermsDropdownPayload) {
  const [data, setData] = useState<TermResponse[]>([]);
  const [meta, setMeta] = useState<TermMeta>(EMPTY_META);
  const [params, setParams] = useState<GetTermsDropdownPayload>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });
  const [loading, setLoading] = useState(false);

  const fetchTerms = useCallback(
    async (override?: GetTermsDropdownPayload) => {
      if (loading) return null; // tránh spam
      setLoading(true);
      try {
        const finalParams: GetTermsDropdownPayload = {
          ...params,
          ...override,
        };

        const res = await TermService.getPaged(finalParams);

        setData(res.terms || []);
        setMeta({
          totalCount: res.totalCount,
          page: res.page,
          pageSize: res.pageSize,
          totalPages: res.totalPages,
          hasPreviousPage: res.hasPreviousPage,
          hasNextPage: res.hasNextPage,
        });
        setParams(finalParams);

        return res;
      } finally {
        setLoading(false);
      }
    },
    [params, loading]
  );

  return {
    data,
    loading,
    meta,
    params,
    setParams,
    fetchTerms,
  };
}
