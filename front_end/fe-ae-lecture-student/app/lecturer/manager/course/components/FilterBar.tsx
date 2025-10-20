"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search } from "lucide-react";

interface Props {
  filterName: string; setFilterName: (v: string) => void;
  filterCode: string; setFilterCode: (v: string) => void;
  createdAfter: string; setCreatedAfter: (v: string) => void;
  createdBefore: string; setCreatedBefore: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  loading?: boolean;
}

export default function FilterBar({
  filterName, setFilterName,
  filterCode, setFilterCode,
  createdAfter, setCreatedAfter,
  createdBefore, setCreatedBefore,
  onApply, onClear, resultCount, totalCount, loading
}: Props) {
  return (
    <div className="border border-slate-200 rounded-md p-3 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-600 mb-3">
        <Filter className="size-3" />
        <span className="text-xs font-medium">Filters</span>
        <span className="ml-auto text-xs text-slate-500">
          {loading ? "Loading..." : `${resultCount}/${totalCount} results`}
        </span>
      </div>

      {/* One-line filter bar */}
      <div className="flex items-end gap-3 flex-wrap sm:flex-nowrap">
        {/* Search name */}
        <div className="flex flex-col flex-1 min-w-[180px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text">Search course name</label>
          <div className="relative">
            <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Enter name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="h-8 text-xs !pl-6"
            />
          </div>
        </div>

        {/* Course code */}
        <div className="flex flex-col w-[150px] sm:w-[160px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text">Course code</label>
          <Input
            placeholder="Enter code"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Created after */}
        <div className="flex flex-col w-[150px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text">Created After</label>
          <div className="relative">
            <Calendar className="size-3 cursor-pointer text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              placeholder="Date"
              type="date"
              value={createdAfter}
              onChange={(e) => setCreatedAfter(e.target.value)}
              className="h-8 text-xs border border-slate-300 cursor-text rounded-md px-6 bg-white w-full"
            />
          </div>
        </div>

        {/* Created before */}
        <div className="flex flex-col w-[150px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text">Created Before</label>
          <div className="relative">
            <Calendar className="size-3 cursor-pointer text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              placeholder="Date"
              type="date"
              value={createdBefore}
              onChange={(e) => setCreatedBefore(e.target.value)}
              className="h-8 text-xs border border-slate-300 cursor-text rounded-md px-6 bg-white w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-end ml-auto">
          <label className="text-[11px] text-transparent mb-1 cursor-text select-none">Action</label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-8 cursor-pointer px-2 text-[11px] text-slate-600"
              onClick={onClear}
            >
              Clear
            </Button>
            <Button
              className="h-8 cursor-pointer px-3 text-[11px]"
              onClick={onApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
