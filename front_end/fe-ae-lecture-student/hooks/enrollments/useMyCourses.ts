import { EnrollmentsService } from "@/services/enrollments.services";
import {
  MyEnrolledCourse,
  GetMyEnrolledCoursesResponse,
} from "@/types/enrollments/enrollments.response";
import { useCallback, useState } from "react";

export function useMyCourses() {
  const [listData, setListData] = useState<MyEnrolledCourse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res: GetMyEnrolledCoursesResponse =
        await EnrollmentsService.getMyCourses();
      setListData(res.courses || []);
      setTotalCount(res.totalCount);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔁 Refetch */
  const refetch = () => fetchMyCourses();

  return {
    listData,
    totalCount,
    loading,
    fetchMyCourses,
    refetch,
  };
}
