"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

interface Props {
  name: string;
  setName: (v: string) => void;
  courseCode: string;
  setCourseCode: (v: string) => void;
  lecturerName: string;
  setLecturerName: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function FilterRow({
  name,
  setName,
  courseCode,
  setCourseCode,
  lecturerName,
  setLecturerName,
  onApply,
  onClear,
}: Props) {
  return (
    <TableRow className="bg-slate-50 !border-0">
      <TableCell className="pl-5 py-2">
        <Input
          placeholder="Course Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs w-full"
        />
      </TableCell>

      <TableCell className="py-2">
        <Input
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="h-8 text-xs w-full"
        />
      </TableCell>

      <TableCell className="py-2">
        <Input
          placeholder="Lecturer"
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
          className="h-8 text-xs w-full"
        />
      </TableCell>

      <TableCell className="py-2 text-center text-slate-400 text-xs">—</TableCell>

      <TableCell className="py-2 text-center text-slate-400 text-xs">—</TableCell>

      {/* ➕ Action cell (Apply / Clear) */}
      <TableCell className="py-2 text-center">
        <div className="flex justify-center items-center gap-2">
          <Button className="h-8 bg-green-50 btn btn-green-slow hover:bg-green-100 hover:shadow-md cursor-pointer rounded-xl px-3 text-xs" onClick={onApply}>
            Apply
          </Button>
          <Button className="h-8 px-3 text-xs" variant="ghost" onClick={onClear}>
            Clear
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
