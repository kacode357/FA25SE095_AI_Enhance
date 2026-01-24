"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";
import { useCourses } from "@/hooks/course/useCourses";
import { useEffect } from "react";

interface Props {
  courseName?: string;
  setCourseName?: (v: string) => void;
  courseCodeSearch?: string;
  setCourseCodeSearch?: (v: string) => void;
  courseCode: string; // used as selected id for both modes
  setCourseCode: (v: string) => void;
  mode?: "course-code" | "specific-course"; // controls which select to show
  onFilterChange: (filters: { courseCodeId?: string; specificCourseId?: string; courseName?: string; courseCodeSearch?: string }) => void;
}

export default function FilterRow({
  courseName,
  setCourseName,
  courseCodeSearch,
  setCourseCodeSearch,
  courseCode,
  setCourseCode,
  onFilterChange,
  mode = "course-code",
}: Props) {
  const { listData: courseCodes, fetchCourseCodes } = useCourseCodes();
  const { listData: coursesResp, fetchCourses } = useCourses();

  useEffect(() => {
    // load options for selects
    fetchCourseCodes({ page: 1, pageSize: 200 });
    fetchCourses({ page: 1, pageSize: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courseOptions = courseCodes || [];
  const specificCourseOptions = coursesResp?.courses || [];

  return (
    <TableRow className="bg-slate-50 border-0!">
      <TableCell className="py-5 pl-5">
        {mode === "course-code" ? (
          <Select value={courseCode} onValueChange={(v) => setCourseCode(v === "__all__" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs w-96 border-slate-200 bg-white ring-0 focus:ring-0 shadow-none">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="text-sm w-full">
              <SelectItem key="all" value="__all__" className="text-sm">
                All
              </SelectItem>
              {courseOptions.map((cc) => (
                <SelectItem key={cc.id} value={cc.id} className="text-sm">
                  {cc.code} — {cc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={courseCode} onValueChange={(v) => setCourseCode(v === "__all__" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs w-72 border-slate-200 ring-0 bg-white focus:ring-0 shadow-none">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="text-sm w-full">
              <SelectItem key="all" value="__all__" className="text-sm">
                All
              </SelectItem>
              {specificCourseOptions
                .filter((c) => c.status === 1)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-sm">
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </TableCell>

      <TableCell className="py-2 w-72">
        {mode === "course-code" ? (
          <Input
            placeholder="Search..."
            value={courseCodeSearch ?? ""}
            onChange={(e) => setCourseCodeSearch?.(e.target.value)}
            className="h-8 text-xs w-full"
          />
        ) : (
          <Input
            placeholder="Search..."
            value={courseName ?? ""}
            onChange={(e) => setCourseName?.(e.target.value)}
            className="h-8 text-xs w-full"
          />
        )}
      </TableCell>

      {/* Empty action cell retained for column alignment (buttons removed). */}
      <TableCell className="py-2 text-center bg-slate-50">
        <div className="h-8" />
      </TableCell>

      <TableCell className="py-2 text-center bg-slate-50">
        <div className="h-8" />
      </TableCell>
    </TableRow>
  );
}
