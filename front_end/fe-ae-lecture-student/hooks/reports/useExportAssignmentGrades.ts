"use client";

import { ReportsService } from "@/services/reports.services";
import { useState } from "react";
import { toast } from "sonner";

export function useExportAssignmentGrades() {
  const [loading, setLoading] = useState(false);

  const exportGrades = async (assignmentId: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const blob = await ReportsService.exportAssignmentGrades(assignmentId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `assignment-grades-${assignmentId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Export successful!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to export assignment grades."
      );
    } finally {
      setLoading(false);
    }
  };

  return { exportGrades, loading };
}
