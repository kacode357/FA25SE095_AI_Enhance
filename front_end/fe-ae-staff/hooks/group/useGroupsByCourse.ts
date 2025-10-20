// hooks/group/useGroupsByCourse.ts
"use client";

import { useCallback, useState } from "react";
import { GroupService } from "@/services/group.services";
import type { GetGroupsByCourseResponse } from "@/types/groups/group.response";

export function useGroupsByCourse() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetGroupsByCourseResponse | null>(null);

  const fetchGroupsByCourse = useCallback(async (courseId: string) => {
    if (!courseId) return null;
    setLoading(true);
    try {
      const res = await GroupService.getByCourse(courseId);
      setData(res);
      return res;
    } catch {
      // interceptor chung xử lý lỗi
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
  }, []);

  return { data, loading, fetchGroupsByCourse, reset };
}
