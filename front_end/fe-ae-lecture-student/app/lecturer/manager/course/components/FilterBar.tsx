"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, GitPullRequestClosed, Search, SlidersHorizontal, Users } from "lucide-react";
import { useState } from "react";

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
  stacked?: boolean; // render filters vertically (for sidebar)
}

export default function FilterBar({
  filterName, setFilterName,
  filterCode, setFilterCode,
  createdAfter, setCreatedAfter,
  createdBefore, setCreatedBefore,
  minEnroll = "", setMinEnroll,
  maxEnroll = "", setMaxEnroll,
  onApply, onClear, resultCount, totalCount, loading,
  stacked = false,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="border rounded-xl p-3 sm:p-4 bg-gradient-to-r from-[#f7f6ff] to-[#fcfbff] backdrop-blur-sm shadow-[0_6px_22px_rgba(2,6,23,0.06)] border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-700 mb-3">
        <Filter className="size-3 text-brand" />
        <span className="text-sm font-semibold text-brand">Filters</span>
        <span className="ml-auto text-[11px] cursor-text inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7f71f4]/10 to-[#f4a23b]/10 text-[#7f71f4]">
          {loading ? "Loading..." : `${resultCount}/${totalCount} results`}
        </span>
      </div>

      {/* Main filter bar */}
      <div className={stacked ? "flex flex-col gap-3" : "flex items-end gap-3 flex-wrap sm:flex-nowrap"}>
        {/* Search name */}
        <div className={stacked ? "flex flex-col w-full" : "flex flex-col flex-1 min-w-[220px]"}>
          <label className="text-sm text-slate-500 mb-1 cursor-text">Search course name</label>
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
        <div className={stacked ? "flex flex-col w-full" : "flex flex-col w-[170px] sm:w-[190px]"}>
          <label className="text-sm text-slate-500 mb-1 cursor-text">Course code</label>
          <Input
            placeholder="Enter code"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="h-9 text-xs focus-visible:ring-brand focus-visible:ring-1"
          />
        </div>

        {/* Actions: show on main row only when Advanced is closed */}
        {!showAdvanced && (
          <div className={`flex flex-col ${stacked ? "items-between" : "items-end ml-auto"}`}>
            <label className="text-[11px] text-black mb-1 cursor-text select-none">
              Action
            </label>
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                className="h-9 cursor-pointer px-3 text-[11px]"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="size-4 text-violet-800" />
                  <span className="text-sm text-violet-800">Advanced</span>
                </div>
              </Button>
              <div>
                <Button
                  variant="ghost"
                  className="h-9 cursor-pointer px-2 text-[11px] text-[#000D83] hover:text-brand"
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
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className={stacked ? "mt-5 grid grid-cols-1 gap-3" : "mt-5 grid grid-cols-2 md:grid-cols-4 gap-3"}>
          {/* Min enroll */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-500 mb-1 cursor-text flex items-center gap-1"><Users className="size-3 text-brand" />Min enroll</label>
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
          <div className="flex flex-col">
            <label className="text-sm text-slate-500 mb-1 cursor-text flex items-center gap-1"><Users className="size-3 text-brand" />Max enroll</label>
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
          <div className="flex flex-col">
            <label className="text-sm text-slate-500 mb-1 cursor-text">Created After</label>
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
          <div className="flex flex-col">
            <label className="text-sm text-slate-500 mb-1 cursor-text">Created Before</label>
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
        </div>
      )}

      {/* Actions: when Advanced is open, move actions to the bottom */}
      {showAdvanced && (
        <div className={`mt-4 pt-3 border-t border-slate-200 ${stacked ? "text-left" : "text-right"}`}>
          <div className={`flex gap-2 ${stacked ? "justify-between" : "justify-end"}`}>
            <Button
              variant="outline"
              className="h-9 cursor-pointer px-3 text-[11px]"
              onClick={() => setShowAdvanced(false)}
            >
              <div className="flex items-center gap-1">
                <GitPullRequestClosed className="size-4 text-violet-800" />
                <span className="text-sm text-violet-800">Hide</span>
              </div>
            </Button>
            <div>
              <Button
                variant="ghost"
                className="h-9 cursor-pointer px-2 text-[11px] text-[#000D83] hover:text-brand"
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
      )}
    </div>
  );
}
