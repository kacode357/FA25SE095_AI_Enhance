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
  term: string;
  setTerm: (v: string) => void;
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
  term,
  setTerm,
  onApply,
  onClear,
}: Props) {
  return (
    <tr className="bg-slate-50 border-b border-slate-200 text-xs">
      {/* Lecturer */}
      <td className="pl-4 py-2 px-2">
        <Input
          placeholder="Lecturer"
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
          className="h-8 text-xs w-full rounded-md border-slate-300"
        />
      </td>

      {/* Course Code */}
      <td className="py-2 px-2">
        <Input
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="h-8 text-xs w-full rounded-md border-slate-300"
        />
      </td>

      {/* Title */}
      <td className="py-2 px-2">
        <Input
          placeholder="Title"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="h-8 text-xs w-full rounded-md border-slate-300"
        />
      </td>

      {/* Term */}
      <td className="py-2 px-2 text-center">
        <Input
          placeholder="Term"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="h-8 text-xs w-full text-center rounded-md border-slate-300"
        />
      </td>

      {/* Year */}
      <td className="py-2 px-2 text-center">
        <Input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-8 text-xs w-full text-center rounded-md border-slate-300"
        />
      </td>

      {/* Status */}
      <td className="py-2 px-2 text-center">
        <select
          value={status ?? ""}
          onChange={(e) =>
            setStatus(
              e.target.value === "" ? undefined : (Number(e.target.value) as 1 | 2 | 3 | 4)
            )
          }
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white w-full focus:outline-none focus:ring-1 focus:ring-slate-300"
        >
          <option value="">All</option>
          <option value="1">Pending</option>
          <option value="2">Approved</option>
          <option value="3">Rejected</option>
          <option value="4">Cancelled</option>
        </select>
      </td>

      {/* Created At */}
      <td className="text-center text-slate-400 py-2 px-2">—</td>

      {/* Actions */}
      <td className="text-center py-2 px-2">
        <div className="flex justify-center items-center gap-3">
          <Button size="sm" className="h-8 px-3 text-xs" onClick={onApply}>
            Apply
          </Button>
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            variant="ghost"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </td>
    </tr>
  );
}
