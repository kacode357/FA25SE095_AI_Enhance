"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search, Tag, User } from "lucide-react";

interface Props {
  filterName: string; setFilterName: (v: string) => void;
  filterCode: string; setFilterCode: (v: string) => void;
  lecturerName: string; setLecturerName: (v: string) => void;
  createdAfter: string; setCreatedAfter: (v: string) => void;
  createdBefore: string; setCreatedBefore: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  loading?: boolean;
}

export default function RequestsFilterBar({
  filterName, setFilterName,
  filterCode, setFilterCode,
  lecturerName, setLecturerName,
  createdAfter, setCreatedAfter,
  createdBefore, setCreatedBefore,
  status, setStatus,
  onApply, onClear, resultCount, totalCount, loading
}: Props) {
  return (
    <div className="border cursor-default border-slate-200 rounded-md p-2 bg-white">
      <div className="flex items-center gap-2 text-slate-600 mb-2">
        <Filter className="size-4 cursor-default" />
        <span className="text-sm cursor-text">Filters</span>
        <span className="ml-auto text-xs cursor-text text-slate-500">
          {loading ? "Loading..." : `${resultCount}/${totalCount} results`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
        <div className="relative sm:col-span-2">
          <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="h-8 text-xs !pl-6"
          />
        </div>

        <Input
          placeholder="Code"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          className="h-8 text-xs"
        />

        <div className="relative">
          <User className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Lecturer name"
            value={lecturerName}
            onChange={(e) => setLecturerName(e.target.value)}
            className="h-8 text-xs !pl-6"
          />
        </div>

        <div className="relative">
          <Calendar className="size-3 cursor-pointer text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={createdAfter}
            onChange={(e) => setCreatedAfter(e.target.value)}
            className="h-8 text-xs border cursor-text border-slate-300 rounded-md px-6 bg-white w-full"
            placeholder="Created after"
          />
        </div>

        <div className="relative">
          <Calendar className="size-3 cursor-pointer text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={createdBefore}
            onChange={(e) => setCreatedBefore(e.target.value)}
            className="h-8 text-xs border cursor-text border-slate-300 rounded-md px-6 bg-white w-full"
            placeholder="Created before"
          />
        </div>

        <div className="relative">
          <Tag className="size-3 cursor-pointer text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            aria-label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md pl-6 cursor-pointer bg-white w-full"
          >
            <option value="">All Statuses</option>
            <option value="1">Pending</option>
            <option value="2">Approved</option>
            <option value="3">Rejected</option>
            <option value="4">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2">
        <Button variant="ghost" className="h-8 cursor-pointer px-2 text-[11px] text-slate-600" onClick={onClear}>
          Clear
        </Button>
        <Button className="h-8 cursor-pointer px-3 text-[11px]" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
