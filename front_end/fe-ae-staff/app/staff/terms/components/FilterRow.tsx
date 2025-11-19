"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { TableHead, TableRow } from "@/components/ui/table";

interface Props {
  filterActive: string;
  setFilterActive: (v: string) => void;
  fetchAll: () => void;
  clearAll: () => void;
  filterStart?: string;
  setFilterStart?: (v: string) => void;
  filterEnd?: string;
  setFilterEnd?: (v: string) => void;
}

export default function FilterRow({
  filterActive,
  setFilterActive,
  fetchAll,
  clearAll,
  filterStart,
  setFilterStart,
  filterEnd,
  setFilterEnd,
}: Props) {
  return (
    <TableRow className="bg-white/95 border-b border-slate-200">
      {/* 1 - Name (empty filter) */}
      <TableHead className="p-2"></TableHead>

      {/* 2 - Description (empty filter) */}
      <TableHead className="p-2"></TableHead>

      {/* 3 - Start Date filter */}
      <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center whitespace-nowrap">
          <div className="w-44">
            <DateTimePicker
              value={filterStart}
              onChange={(v) => setFilterStart?.(v)}
              placeholder="Start date"
              className="-ml-10"
            />
          </div>
        </div>
      </TableHead>


      {/* 5 - End Date filter */}
      <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center whitespace-nowrap -mr-10">
          <div className="w-44 ">
            <DateTimePicker
              value={filterEnd}
              onChange={(v) => setFilterEnd?.(v)}
              placeholder="End date"
            />
          </div>
        </div>
      </TableHead>

      {/* 6 - Created At (empty) */}
      <TableHead className="p-2"></TableHead>

            <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center">
          <select
            title="Filter"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white w-28 text-center"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </TableHead>

      {/* 7 - Created At (empty) */}
      <TableHead className="p-2"></TableHead>

      {/* 8 - Actions (Apply/Clear buttons) */}
      <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button className="h-8 px-3 text-xs btn btn-gradient-slow" onClick={fetchAll}>
            Apply
          </Button>
          <Button className="h-8 px-3 text-xs btn btn-gradient-slow" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </TableHead>
    </TableRow>
  );
}
