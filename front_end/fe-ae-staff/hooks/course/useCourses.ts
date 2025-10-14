"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { GetAllCoursesQuery } from "@/types/course/course.payload";
import { GetAllCoursesResponse } from "@/types/course/course.response";

export function useCourses() {
  const [listData, setListData] = useState<GetAllCoursesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  /** ✅ Fetch danh sách courses (GET /api/Courses/all) */
  const fetchCourses = async (params?: GetAllCoursesQuery) => {
    try {
      setLoading(true);
      // Gửi payload (params) -> nhận response (res)
      const res = await CourseService.getAll(params);
      setListData(res);
    } finally {
      setLoading(false);
    }
  };

  return { listData, loading, fetchCourses };
}
