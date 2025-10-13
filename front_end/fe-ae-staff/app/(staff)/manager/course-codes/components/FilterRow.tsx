"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
  filterCode: string; setFilterCode: (v: string) => void;
  filterTitle: string; setFilterTitle: (v: string) => void;
  filterDept: string; setFilterDept: (v: string) => void;
  createdAt: string; setCreatedAt: (v: string) => void;
  filterActive: string; setFilterActive: (v: string) => void;
  fetchAll: () => void;
  clearAll: () => void;
}

export default function FilterRow({
  filterCode, setFilterCode,
  filterTitle, setFilterTitle,
  filterDept, setFilterDept,
  createdAt, setCreatedAt,
  filterActive, setFilterActive,
  fetchAll, clearAll,
}: Props) {
  return (
    <TableRow className="bg-white/95 border-b border-slate-200">
      {/* Code */}
      <TableHead className="p-2 text-center">
        <Input
          placeholder="Code"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          className="h-8 text-xs text-center"
        />
      </TableHead>

      {/* Title */}
      <TableHead className="p-2">
        <div className="relative">
          <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search title"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            className="h-8 text-xs !pl-6"
          />
        </div>
      </TableHead>

      {/* Department */}
      <TableHead className="p-2 text-center">
        <Input
          placeholder="Department"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="h-8 text-xs text-center"
        />
      </TableHead>

      {/* Active status */}
      <TableHead className="p-2 text-center">
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white w-full text-center"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </TableHead>

      {/* Created At */}
      <TableHead className="p-2 text-center">
        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="h-8 text-xs border border-slate-300 rounded-md px-1 bg-white w-full"
        />
      </TableHead>

      {/* Buttons */}
      <TableHead className="p-2 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* ✅ Bọc callback để không truyền event */}
          <Button className="h-8 px-3 text-xs" onClick={() => fetchAll()}>
            Apply
          </Button>
          <Button className="h-8 px-3 text-xs" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </TableHead>
    </TableRow>
  );
}
