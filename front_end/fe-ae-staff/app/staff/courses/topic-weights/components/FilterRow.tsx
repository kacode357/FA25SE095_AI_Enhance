"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
  filterTopicName: string; setFilterTopicName: (v: string) => void;
  filterCourseCode: string; setFilterCourseCode: (v: string) => void;
  filterSpecificCourse: string; setFilterSpecificCourse: (v: string) => void;
  filterConfiguredAt: string; setFilterConfiguredAt: (v: string) => void;
  filterEditable: string; setFilterEditable: (v: string) => void;
  fetchAll: () => void;
  clearAll: () => void;
}

export default function FilterRow({
  filterTopicName, setFilterTopicName,
  filterCourseCode, setFilterCourseCode,
  filterSpecificCourse, setFilterSpecificCourse,
  filterConfiguredAt, setFilterConfiguredAt,
  filterEditable, setFilterEditable,
  fetchAll, clearAll,
}: Props) {
  return (
    <TableRow className="bg-white/95 border-b border-slate-200">
      {/* Topic Name */}
      <TableHead className="p-2 text-center">
        <div className="relative">
          <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search topic"
            value={filterTopicName}
            onChange={(e) => setFilterTopicName(e.target.value)}
            className="h-8 text-xs pl-7"
          />
        </div>
      </TableHead>

      {/* Course Code */}
      <TableHead className="p-2 text-center">
        <Input
          placeholder="Course Code"
          value={filterCourseCode}
          onChange={(e) => setFilterCourseCode(e.target.value)}
          className="h-8 text-xs"
        />
      </TableHead>

      {/* Specific Course */}
      <TableHead className="p-2 text-center">
        <Input
          placeholder="Specific Course"
          value={filterSpecificCourse}
          onChange={(e) => setFilterSpecificCourse(e.target.value)}
          className="h-8 text-xs"
        />
      </TableHead>

      {/* Weight % with Editable Filter */}
      <TableHead className="p-2 text-center">
        <select
          title="Filter Editable"
          value={filterEditable}
          onChange={(e) => setFilterEditable(e.target.value)}
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white w-full text-center"
        >
          <option value="">All</option>
          <option value="true">Editable</option>
          <option value="false">Read-only</option>
        </select>
      </TableHead>

      {/* Configured At */}
      <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center">
          <div className="w-56 mx-auto">
            <DateTimePicker
              value={filterConfiguredAt}
              onChange={(v) => setFilterConfiguredAt(v ?? "")}
              placeholder="Configured at"
              className=""
            />
          </div>
        </div>
      </TableHead>

      {/* Actions column - just buttons like course-codes */}
      <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button className="h-8 px-3 text-xs btn btn-green-slow" onClick={() => fetchAll()}>
            Apply
          </Button>
          <Button className="h-8 px-3 cursor-pointer bg-slate-50 hover:bg-slate-100 text-black! text-xs" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </TableHead>
    </TableRow>
  );
}
