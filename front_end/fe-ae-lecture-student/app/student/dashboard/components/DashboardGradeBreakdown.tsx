// app/student/dashboard/components/DashboardGradeBreakdown.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useStudentGradeBreakdown } from "@/hooks/dashboard/useStudentGradeBreakdown";
import type { StudentGradesOverviewData } from "@/types/dashboard/dashboard.response";

type Props = {
  coursesData?: StudentGradesOverviewData;
  loading: boolean;
};

export default function DashboardGradeBreakdown({ coursesData, loading }: Props) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { data, loading: breakdownLoading, fetchGradeBreakdown } = useStudentGradeBreakdown();

  // Set default course
  useEffect(() => {
    if (coursesData?.courses && coursesData.courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(coursesData.courses[0].courseId);
    }
  }, [coursesData]);

  // Fetch breakdown when course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchGradeBreakdown(selectedCourseId);
    }
  }, [selectedCourseId]);

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Grade Breakdown
        </CardTitle>
        <Award className="h-4 w-4 text-indigo-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <BreakdownSkeleton />
        ) : (
          <>
            {/* Course selector */}
            <div className="mb-4">
              <Select
                disabled={!coursesData?.courses || coursesData.courses.length === 0}
                value={selectedCourseId}
                onValueChange={(val) => setSelectedCourseId(val)}
              >
                <SelectTrigger className="w-full border-indigo-100 bg-white">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesData?.courses.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.courseCode} - {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Summary */}
            {breakdownLoading ? (
              <BreakdownSkeleton />
            ) : data?.data ? (
              <>
                <div className="mb-4 flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                  <div>
                    <p className="text-xs text-slate-600">Weighted Course Grade</p>
                    <p className="text-2xl font-bold text-nav">
                      {data.data.weightedCourseGrade.toFixed(2)}%
                    </p>
                    <p className="text-sm font-semibold text-indigo-600">
                      {data.data.letterGrade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Weight Distribution</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {data.data.totalWeightUsed.toFixed(0)}% used
                    </p>
                    <p className="text-xs text-slate-500">
                      {data.data.remainingWeight.toFixed(0)}% remaining
                    </p>
                  </div>
                </div>

                {/* Assignment Breakdown Table */}
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="space-y-2">
                    {data.data.assignmentBreakdown.map((assignment) => (
                      <div
                        key={assignment.assignmentId}
                        className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-nav">
                              {assignment.assignmentTitle}
                            </p>
                            <p className="text-xs text-slate-500">
                              {assignment.topicName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-indigo-600">
                              {assignment.grade}/{assignment.maxPoints}
                            </p>
                            <p className="text-xs text-slate-500">
                              {assignment.status}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Weight:</span>
                            <span className="font-semibold text-slate-700">
                              {assignment.weight}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-slate-500">Contribution:</span>
                            <span className="font-semibold text-green-600">
                              {assignment.weightedContribution.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {assignment.gradedAt && (
                          <p className="mt-2 text-xs text-slate-400">
                            Graded: {new Date(assignment.gradedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                No grade breakdown available
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
