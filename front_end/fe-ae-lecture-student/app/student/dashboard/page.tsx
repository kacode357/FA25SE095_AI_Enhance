// app/student/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { useTerms } from "@/hooks/term/useTerms";

import DashboardOverviewCard from "./components/DashboardOverviewCard";
import DashboardPerformanceCard from "./components/DashboardPerformanceCard";
import DashboardGradeDistribution from "./components/DashboardGradeDistribution";
import DashboardPendingAssignments from "./components/DashboardPendingAssignments";
import DashboardCurrentCourses from "./components/DashboardCurrentCourses";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function StudentDashboardPage() {
  const { data: terms, loading: termsLoading, fetchTerms } = useTerms();
  const [termId, setTermId] = useState<string | undefined>();

  // Fetch terms on load
  useEffect(() => {
    fetchTerms();
  }, []);

  // Set default term after load
  useEffect(() => {
    if (terms.length > 0 && !termId) {
      setTermId(terms[0].id);
    }
  }, [terms]);

  return (
    <div className="mx-auto max-w-6xl px-2 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 flex items-center gap-2 text-2xl font-semibold">
            <CalendarDays className="h-6 w-6 text-indigo-500" />
            Student Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Overview of grades, performance, and coursework.
          </p>
        </div>

        {/* SELECT TERM */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Select Term:</span>

          <Select
            disabled={termsLoading || !terms.length}
            value={termId ?? ""}
            onValueChange={(val) => setTermId(val)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Choose term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardOverviewCard termId={termId} />
        <DashboardGradeDistribution termId={termId} />
        <DashboardPerformanceCard termId={termId} />
      </div>

      {/* BOTTOM GRID */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardPendingAssignments />
        <DashboardCurrentCourses />
      </div>
    </div>
  );
}
