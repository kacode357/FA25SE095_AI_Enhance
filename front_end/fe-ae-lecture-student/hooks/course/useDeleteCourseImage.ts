"use client";

import { CourseService } from "@/services/course.services";
import { DeleteCourseImageRequest } from "@/types/courses/course.payload";
import { DeleteCourseImageResponse } from "@/types/courses/course.response";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteCourseImage() {
  const [loading, setLoading] = useState(false);

  const deleteCourseImage = async (
    data: DeleteCourseImageRequest
  ): Promise<DeleteCourseImageResponse | null> => {
    setLoading(true);
    try {
      const res = await CourseService.deleteCourseImage(data);
      if (res.success) {
        toast.success(res.message || "Image deleted successfully!");
      } else {
        toast.error(res.message || "Unable to delete course!");
      }
      return res;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "False deleting course photo!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCourseImage, loading };
}
