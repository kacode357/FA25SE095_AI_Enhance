// app/student/my-courses/components/FilterBar.tsx
"use client";

import { useState } from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
import { GetMyCoursesQuery } from "@/types/courses/course.payload";

type Props = {
  onFilter: (filters: Pick<GetMyCoursesQuery, "name" | "courseCode" | "lecturerName" | "sortBy">) => void;
  onReset?: () => void;
};

export default function MyCoursesFilterBar({ onFilter, onReset }: Props) {
  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [name, setName] = useState("");
  const [sortBy, setSortBy] = useState<GetMyCoursesQuery["sortBy"]>("CreatedAt");

  const apply = () => onFilter({ name, courseCode, lecturerName, sortBy });
  const reset = () => {
    setName("");
    setCourseCode("");
    setLecturerName("");
    setSortBy("CreatedAt");
    onReset?.();
  };

  return (
    <div
      className="rounded-2xl p-3 md:p-4"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3">
        {/* Name (title/desc) */}
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-brand" />
          <input
            className="input h-9"
            placeholder="Search by name/title…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Course code */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand" />
          <input
            className="input h-9"
            placeholder="Filter by course code…"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </div>

        {/* Lecturer */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand" />
          <input
            className="input h-9"
            placeholder="Filter by lecturer…"
            value={lecturerName}
            onChange={(e) => setLecturerName(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as GetMyCoursesQuery["sortBy"])}
            className="h-9 rounded-lg px-2"
            style={{ border: "1px solid var(--border)", background: "var(--white)", color: "var(--foreground)" }}
          >
            <option value="CreatedAt">Newest</option>
            <option value="Name">Name</option>
            <option value="CourseCode">Course Code</option>
            <option value="EnrollmentCount">Most Enrolled</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button onClick={apply} className="btn btn-gradient-slow h-9 px-3" title="Apply filters">
            <Filter className="w-4 h-4" />
            <span>Apply</span>
          </button>
          <button
            onClick={reset}
            className="btn h-9 px-3"
            style={{ background: "var(--card)", color: "var(--brand)", border: "1px solid var(--brand)" }}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
