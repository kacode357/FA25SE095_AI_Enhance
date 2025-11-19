"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

interface Props {
  name: string;
  setName: (v: string) => void;
  lecturerName: string;
  setLecturerName: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function FilterRow({
  name,
  setName,
  lecturerName,
  setLecturerName,
  onApply,
  onClear,
}: Props) {
  return (
    <TableRow className="bg-slate-50 !border-0 text-xs">
      {/* Course Name */}
      <TableCell className="pl-4 py-2">
        <Input
          placeholder="Course Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs w-full"
        />
      </TableCell>

      {/* Lecturer */}
      <TableCell className="py-2">
        <Input
          placeholder="Lecturer"
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
          className="h-8 text-xs w-full"
        />
      </TableCell>

      {/* Term */}
      <TableCell className="py-2 text-center text-slate-400 text-xs">—</TableCell>

      {/* Created At */}
      <TableCell className="py-2 text-center text-slate-400 text-xs">—</TableCell>

      {/* Action buttons */}
      <TableCell className="py-2 text-center">
        <div className="flex justify-center items-center gap-2">
          <Button className="h-8 btn btn-gradient-slow px-3 text-xs" onClick={onApply}>
            Apply
          </Button>
          <Button
            className="h-8 px-3 text-xs"
            variant="ghost"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
