"use client";

import { useEffect, useState } from "react";
import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useEnrollments } from "@/hooks/enrollments/useEnrollments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Filters = { name: string; courseCode: string; lecturerName: string };

export default function StudentCoursesPage() {
  const { listData, loading, fetchAvailableCourses } = useAvailableCourses();
  const { loading: enrolling, joinCourse, leaveCourse } = useEnrollments();

  const [filters, setFilters] = useState<Filters>({
    name: "",
    courseCode: "",
    lecturerName: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters);

  // debounce input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(t);
  }, [filters]);

  // fetch list
  useEffect(() => {
    fetchAvailableCourses({
      page: 1,
      pageSize: 12,
      name: debouncedFilters.name || undefined,
      courseCode: debouncedFilters.courseCode || undefined,
      lecturerName: debouncedFilters.lecturerName || undefined,
      sortBy: "CreatedAt",
      sortDirection: "desc",
    });
  }, [debouncedFilters, fetchAvailableCourses]);

  const handleApply = () => setDebouncedFilters(filters);
  const handleClear = () => {
    const d: Filters = { name: "", courseCode: "", lecturerName: "" };
    setFilters(d);
    setDebouncedFilters(d);
  };

  const handleJoin = async (courseId: string, accessCode?: string) => {
    const res = await joinCourse(courseId, accessCode ? { accessCode } : {});
    if (res?.success) {
      fetchAvailableCourses({ page: 1, pageSize: 12 }); // refresh list
    }
  };

  const handleLeave = async (courseId: string) => {
    const res = await leaveCourse(courseId);
    if (res?.success) {
      fetchAvailableCourses({ page: 1, pageSize: 12 });
    }
  };

  return (
    <div className="min-h-full flex flex-col p-4 gap-4 bg-white text-slate-900">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Available Courses</h1>
        <p className="text-slate-500 text-sm">Browse and join available courses</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-md border border-slate-200">
        <Input
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="w-48"
        />
        <Input
          placeholder="Course code"
          value={filters.courseCode}
          onChange={(e) => setFilters({ ...filters, courseCode: e.target.value })}
          className="w-40"
        />
        <Input
          placeholder="Lecturer name"
          value={filters.lecturerName}
          onChange={(e) => setFilters({ ...filters, lecturerName: e.target.value })}
          className="w-48"
        />
        <Button onClick={handleApply} className="bg-emerald-600 text-white">
          Apply
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading...</div>
      ) : listData.length === 0 ? (
        <div className="py-10 text-center text-slate-500">No courses available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listData.map((course) => {
            const isEnrolled = course.enrollmentStatus?.isEnrolled === true;

            return (
              <Card key={course.id} className="flex flex-col border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-800">
                    {course.name}
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {course.courseCode} • {course.lecturerName}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <p>
                    Created:{" "}
                    <span className="font-medium">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p>Enrolled: {course.enrollmentCount}</p>

                  {/* Join / Leave */}
                  {isEnrolled ? (
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      disabled={enrolling}
                      onClick={() => handleLeave(course.id)}
                    >
                      {enrolling ? "Leaving..." : "Leave"}
                    </Button>
                  ) : (
                    <JoinSection
                      requiresAccessCode={course.requiresAccessCode}
                      enrolling={enrolling}
                      onJoin={(code) => handleJoin(course.id, code)}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Component nhỏ để xử lý join với access code */
function JoinSection({
  requiresAccessCode,
  enrolling,
  onJoin,
}: {
  requiresAccessCode: boolean;
  enrolling: boolean;
  onJoin: (accessCode?: string) => void;
}) {
  const [accessCode, setAccessCode] = useState("");

  if (!requiresAccessCode) {
    return (
      <Button
        className="bg-emerald-600 text-white"
        disabled={enrolling}
        onClick={() => onJoin()}
      >
        {enrolling ? "Joining..." : "Join"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Enter access code"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
      />
      <Button
        className="bg-emerald-600 text-white"
        disabled={enrolling || !accessCode}
        onClick={() => onJoin(accessCode)}
      >
        {enrolling ? "Joining..." : "Join with Code"}
      </Button>
    </div>
  );
}
