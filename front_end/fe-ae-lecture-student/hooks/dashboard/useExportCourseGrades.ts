"use client";

import { DashboardService } from "@/services/dashboard.services";
import { useState } from "react";
import { toast } from "sonner";

export function useExportCourseGrades() {
  const [loading, setLoading] = useState(false);

  const exportCourseGrades = async (courseId: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await DashboardService.exportCourseGrades(courseId);
      if (!res) throw new Error("No file returned");

      const url = window.URL.createObjectURL(res.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.fileName || `course-grades-${courseId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Export successful!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export course grades.");
    } finally {
      setLoading(false);
    }
  };

  return { exportCourseGrades, loading };
}
