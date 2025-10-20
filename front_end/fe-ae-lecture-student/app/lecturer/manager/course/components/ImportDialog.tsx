"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useImportEnrollments } from "@/hooks/enrollments/useImportEnrollments";
import { CourseItem } from "@/types/courses/course.response";
import { useMemo, useState } from "react";

export default function ImportDialog({
  title,
  onSubmit,
  onCancel,
  courses = [],
}: {
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
  courses?: CourseItem[];
}) {
  const { importEnrollments, loading } = useImportEnrollments();
  const [file, setFile] = useState<File | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [createAccounts, setCreateAccounts] = useState(false);

  const sortedCourses = useMemo(() => {
    return courses
      .filter((c) => c.status === 2)
      .sort((a, b) => a.courseCodeTitle.localeCompare(b.courseCodeTitle));
  }, [courses]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedCourseIds(sortedCourses.map((c) => c.id));
  const clearAll = () => setSelectedCourseIds([]);

  const handleSubmit = async () => {
    if (!file || selectedCourseIds.length === 0) return;

    const res = await importEnrollments({
      file,
      courseIds: selectedCourseIds,
      createAccountIfNotFound: createAccounts,
    });

    if (res?.success) {
      onSubmit();
    }
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Giới thiệu */}
        <p className="text-sm text-slate-600">
          Upload an Excel (.xlsx or .xls) file containing student enrollments. Then select one or more courses below.
        </p>

        {/* Upload file */}
        <input
          placeholder="File"
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-slate-300 rounded-md p-2 cursor-pointer text-sm"
        />

        {file && (
          <div className="text-xs text-slate-500">
            Selected file: <span className="font-medium">{file.name}</span>
          </div>
        )}

        {/* ✅ Checkbox create accounts */}
        <div className="flex items-center gap-2 py-1">
          <Checkbox
            id="createAccounts"
            checked={createAccounts}
            onCheckedChange={(checked) => setCreateAccounts(!!checked)}
            className="border-slate-400 text-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <label
            htmlFor="createAccounts"
            className="text-sm text-slate-700 cursor-pointer select-none"
          >
            Create accounts for students not found
          </label>
        </div>

        {/* Chọn course */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Apply to Courses</p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-7 cursor-pointer px-2 text-xs"
                onClick={selectAll}
                disabled={sortedCourses.length === 0}
              >
                Select all
              </Button>
              <Button
                variant="ghost"
                className="h-7 cursor-pointer px-2 text-xs"
                onClick={clearAll}
                disabled={selectedCourseIds.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {sortedCourses.length === 0 ? (
            <div className="text-xs text-slate-500">No courses available.</div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-auto p-1 rounded-md border border-slate-200">
              {sortedCourses.map((c) => {
                const selected = selectedCourseIds.includes(c.id);
                return (
                  <Badge
                    key={c.id}
                    variant={selected ? "default" : "outline"}
                    className={`cursor-pointer select-none ${selected
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : ""
                      }`}
                    onClick={() => toggleCourse(c.id)}
                  >
                    {c.courseCodeTitle}
                  </Badge>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-slate-500">
            You can import one file into multiple courses. Selected courses:{" "}
            <span className="font-bold">{selectedCourseIds.length}</span>
          </p>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading || !file || selectedCourseIds.length === 0}
          className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white"
        >
          {loading ? "Importing..." : "Import"}
        </Button>
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
