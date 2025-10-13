"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  lecturerName: string;
  setLecturerName: (v: string) => void;
  courseCode: string;
  setCourseCode: (v: string) => void;
  status: 1 | 2 | 3 | 4 | undefined;
  setStatus: (v: 1 | 2 | 3 | 4 | undefined) => void;
  department: string;
  setDepartment: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function FilterRow({
  lecturerName,
  setLecturerName,
  courseCode,
  setCourseCode,
  status,
  setStatus,
  department,
  setDepartment,
  year,
  setYear,
  onApply,
  onClear,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border-b border-slate-200 rounded-md">
      {/* Lecturer */}
      <Input
        placeholder="Lecturer Name"
        value={lecturerName}
        onChange={(e) => setLecturerName(e.target.value)}
        className="h-8 text-xs w-40"
      />

      {/* Course Code */}
      <Input
        placeholder="Course Code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        className="h-8 text-xs w-32"
      />

      {/* Department */}
      <Input
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="h-8 text-xs w-32"
      />

      {/* Year */}
      <Input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="h-8 text-xs w-24"
      />

      {/* Status */}
      <select
        value={status ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          setStatus(val === "" ? undefined : (Number(val) as 1 | 2 | 3 | 4));
        }}
        className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white w-32"
      >
        <option value="">All Status</option>
        <option value="1">Pending</option>
        <option value="2">Approved</option>
        <option value="3">Rejected</option>
        <option value="4">Cancelled</option>
      </select>

      {/* Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <Button className="h-8 px-3 text-xs" onClick={onApply}>
          Apply
        </Button>
        <Button className="h-8 px-3 text-xs" variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
