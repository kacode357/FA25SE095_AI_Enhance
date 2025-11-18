"use client";

import { Button } from "@/components/ui/button";
import { TableHead, TableRow } from "@/components/ui/table";

interface Props {
  filterActive: string;
  setFilterActive: (v: string) => void;
  fetchAll: () => void;
  clearAll: () => void;
}

export default function FilterRow({
  filterActive,
  setFilterActive,
  fetchAll,
  clearAll,
}: Props) {
  return (
    <TableRow className="bg-white/95 border-b border-slate-200">
      <TableHead colSpan={2}></TableHead>
      <TableHead className="p-2 text-center">
        <select
          title="Filter"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white w-full text-center"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </TableHead>
      <TableHead colSpan={2} className="p-2 text-center">
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
