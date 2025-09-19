"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
  filterCode: string; setFilterCode: (v: string) => void;
  query: string; setQuery: (v: string) => void;
  filterSemester: string; setFilterSemester: (v: string) => void; semesters: string[];
  filterStatus: string; setFilterStatus: (v: string) => void;
  clearAll: () => void; resultCount: number;
}

export default function FilterRow({ filterCode, setFilterCode, query, setQuery, filterSemester, setFilterSemester, semesters, filterStatus, setFilterStatus, clearAll, resultCount }: Props) {
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
            placeholder="Search name / …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-xs !pl-6"
          />
        </div>
      </TableHead>
      <TableHead className="p-2 text-center">
        <select
          aria-label="Filter by semester"
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="h-8 text-xs cursor-pointer border border-slate-300 rounded-md px-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
        >
          <option value="all">All</option>
          {semesters.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </TableHead>
      <TableHead className="p-2 text-center">
        {/* Empty under Students for alignment */}
      </TableHead>
      <TableHead className="p-2 text-center">
        <select
          aria-label="Filter by status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 text-xs cursor-pointer border border-slate-300 rounded-md px-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </TableHead>
      <TableHead className="p-2 text-center hidden xl:table-cell">
        <input
          type="date"
          className="h-8 text-xs cursor-text border border-slate-300 rounded-md px-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
          aria-label="Filter created from"
        />
      </TableHead>
      <TableHead className="p-2 text-center hidden xl:table-cell">
        <input
          type="date"
          className="h-8 text-xs cursor-text border border-slate-300 rounded-md px-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
          aria-label="Filter updated from"
        />
      </TableHead>
      <TableHead className="p-2 text-center">
        <div className="flex flex-row items-center justify-center gap-2">
          <div className="text-[10px] text-slate-500">{resultCount} result{resultCount !== 1 && "s"}</div>
          <Button
            variant="ghost"
            className="h-7 px-2 text-[11px] text-slate-600 !bg-slate-100 hover:bg-slate-300 hover:text-slate-800 transition-colors duration-150"
            onClick={clearAll}
          >
            Clear
          </Button>
        </div>
      </TableHead>
    </TableRow>
  );
}
