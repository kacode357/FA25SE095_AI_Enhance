"use client";

import { CourseService } from "@/services/course.services";
import { UploadCourseImageRequest } from "@/types/courses/course.payload";
import { UploadCourseImageResponse } from "@/types/courses/course.response";
import { useState } from "react";

export function useUploadCourseImage() {
  const [loading, setLoading] = useState(false);

  const uploadCourseImage = async (
    payload: UploadCourseImageRequest
  ): Promise<UploadCourseImageResponse | null> => {
    if (loading) return null;

    setLoading(true);
    try {
      const res = await CourseService.uploadCourseImage(payload);

      // toast.success(res.message || "Course image uploaded successfully");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { uploadCourseImage, loading };
}
