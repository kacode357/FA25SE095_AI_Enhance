"use client";

import { useState } from "react";
import { CourseService } from "@/services/course.services";
import { GetCourseByIdResponse } from "@/types/course/course.response";

export function useCourseById() {
  const [data, setData] = useState<GetCourseByIdResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCourseById = async (id: string) => {
    setLoading(true);
    const res = await CourseService.getById(id);
    setData(res);
    setLoading(false);
  };

  return { data, loading, fetchCourseById };
}
