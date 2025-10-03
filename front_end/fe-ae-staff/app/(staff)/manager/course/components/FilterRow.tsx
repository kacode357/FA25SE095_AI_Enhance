"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
  filterCode: string; setFilterCode: (v: string) => void;
  filterName: string; setFilterName: (v: string) => void;
  createdAt: string; setCreatedAt: (v: string) => void;
  fetchAll: () => void;
  clearAll: () => void;
  resultCount: number;
}

export default function FilterRow({
  filterCode, setFilterCode,
  filterName, setFilterName,
  createdAt, setCreatedAt,
  fetchAll, clearAll, resultCount,
}: Props) {
  return (
    <TableRow className="bg-white/95 border-b border-slate-200">
      <TableHead className="p-2 text-center">
        <Input
          placeholder="Code"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          className="h-8 text-xs text-center"
        />
      </TableHead>
      <TableHead className="p-2">
        <div className="relative">
          <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="h-8 text-xs !pl-6"
          />
        </div>
      </TableHead>
      <TableHead className="p-2 text-center"></TableHead>
      <TableHead className="p-2 text-center"></TableHead>
      <TableHead className="p-2 text-center">
        <div className="flex flex-col gap-1">
          <input
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="h-7 text-xs border border-slate-300 rounded-md px-1 bg-white"
          />
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="text-[10px] text-slate-500">{resultCount} results</div>
          <Button variant="ghost" className="h-7 px-2 text-[11px] text-slate-600"
            onClick={fetchAll}>Apply</Button>
          <Button variant="ghost" className="h-7 px-2 text-[11px] text-slate-600"
            onClick={clearAll}>Clear</Button>
        </div>
      </TableHead>
    </TableRow>
  );
}
