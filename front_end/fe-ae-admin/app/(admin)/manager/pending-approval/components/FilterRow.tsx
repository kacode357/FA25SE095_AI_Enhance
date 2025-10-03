"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type FilterRowProps = {
  qEmail: string;
  setQEmail: (v: string) => void;
  qInstitution: string;
  setQInstitution: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  createdFrom: string;
  setCreatedFrom: (v: string) => void;
  resultCount: number;
  clearAll: () => void;
};

export default function FilterRow({
  qEmail,
  setQEmail,
  qInstitution,
  setQInstitution,
  filterRole,
  setFilterRole,
  createdFrom,
  setCreatedFrom,
  resultCount,
  clearAll,
}: FilterRowProps) {
  return (
    <TableRow className="bg-slate-100/60 border-y border-slate-200">
      {/* Email */}
      <TableCell className="px-2 py-1">
        <Input
          placeholder="Filter email..."
          value={qEmail}
          onChange={(e) => setQEmail(e.target.value)}
          className="h-8 text-xs"
        />
      </TableCell>

      {/* Name (not filterable) */}
      <TableCell className="px-2 py-1 text-center text-slate-400 text-xs">
        —
      </TableCell>

      {/* Role */}
      <TableCell className="px-2 py-1">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="lecturer">Lecturer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      {/* Institution */}
      <TableCell className="px-2 py-1">
        <Input
          placeholder="Filter institution..."
          value={qInstitution}
          onChange={(e) => setQInstitution(e.target.value)}
          className="h-8 text-xs"
        />
      </TableCell>

      {/* Created At */}
      <TableCell className="px-2 py-1 hidden xl:table-cell">
        <Input
          type="date"
          value={createdFrom}
          onChange={(e) => setCreatedFrom(e.target.value)}
          className="h-8 text-xs"
        />
      </TableCell>

      {/* Last Login (not filterable) */}
      <TableCell className="px-2 py-1 hidden xl:table-cell text-center text-slate-400 text-xs">
        —
      </TableCell>

      {/* Actions */}
      <TableCell className="px-2 py-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-slate-500">
            {resultCount} results
          </span>
          <Button
            variant="ghost"
            onClick={clearAll}
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          >
            Clear
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}