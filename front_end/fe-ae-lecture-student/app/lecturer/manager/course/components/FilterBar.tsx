"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search, Users } from "lucide-react";

interface Props {
  filterName: string; setFilterName: (v: string) => void;
  filterCode: string; setFilterCode: (v: string) => void;
  createdAfter: string; setCreatedAfter: (v: string) => void;
  createdBefore: string; setCreatedBefore: (v: string) => void;
  minEnroll?: string; setMinEnroll?: (v: string) => void;
  maxEnroll?: string; setMaxEnroll?: (v: string) => void;
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
  minEnroll = "", setMinEnroll,
  maxEnroll = "", setMaxEnroll,
  onApply, onClear, resultCount, totalCount, loading
}: Props) {
  return (
    <div className="border rounded-xl p-3 sm:p-4 bg-white/80 backdrop-blur-sm shadow-[0_6px_22px_rgba(2,6,23,0.06)] border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-700 mb-3">
        <Filter className="size-3 text-brand" />
        <span className="text-xs font-semibold text-brand">Filters</span>
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
            <Search className="size-3 text-brand absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Enter name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="h-9 text-xs !pl-6 focus-visible:ring-brand focus-visible:ring-1"
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
            className="h-9 text-xs focus-visible:ring-brand focus-visible:ring-1"
          />
        </div>

        {/* Min enroll */}
        <div className="flex flex-col w-[120px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text flex items-center gap-1"><Users className="size-3 text-brand"/>Min</label>
          <Input
            type="number"
            placeholder="0"
            value={minEnroll}
            onChange={(e) => setMinEnroll && setMinEnroll(e.target.value)}
            className="h-9 text-xs focus-visible:ring-brand focus-visible:ring-1"
            min={0}
          />
        </div>

        {/* Max enroll */}
        <div className="flex flex-col w-[120px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text flex items-center gap-1"><Users className="size-3 text-brand"/>Max</label>
          <Input
            type="number"
            placeholder="∞"
            value={maxEnroll}
            onChange={(e) => setMaxEnroll && setMaxEnroll(e.target.value)}
            className="h-9 text-xs focus-visible:ring-brand focus-visible:ring-1"
            min={0}
          />
        </div>

        {/* Created after */}
        <div className="flex flex-col w-[150px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text">Created After</label>
          <div className="relative">
            <Calendar className="size-3 cursor-pointer text-brand absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              placeholder="Date"
              type="date"
              value={createdAfter}
              onChange={(e) => setCreatedAfter(e.target.value)}
              className="h-9 text-xs border border-slate-300 cursor-text rounded-md px-6 bg-white w-full focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Created before */}
        <div className="flex flex-col w-[150px]">
          <label className="text-[11px] text-slate-500 mb-1 cursor-text">Created Before</label>
          <div className="relative">
            <Calendar className="size-3 cursor-pointer text-brand absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              placeholder="Date"
              type="date"
              value={createdBefore}
              onChange={(e) => setCreatedBefore(e.target.value)}
              className="h-9 text-xs border border-slate-300 cursor-text rounded-md px-6 bg-white w-full focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-end ml-auto">
          <label className="text-[11px] text-transparent mb-1 cursor-text select-none">Action</label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-9 cursor-pointer px-2 text-[11px] text-slate-600 hover:text-brand"
              onClick={onClear}
            >
              Clear
            </Button>
            <Button
              className="h-9 cursor-pointer px-3 text-[11px] btn btn-gradient"
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
