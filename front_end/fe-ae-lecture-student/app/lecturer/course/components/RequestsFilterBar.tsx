"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select/Select";
import { Calendar, Filter, GitPullRequestClosed, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

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
  stacked?: boolean; // render vertically for sidebar
}

export default function RequestsFilterBar({
  filterName, setFilterName,
  filterCode, setFilterCode,
  lecturerName, setLecturerName,
  createdAfter, setCreatedAfter,
  createdBefore, setCreatedBefore,
  status, setStatus,
  onApply, onClear, resultCount, totalCount, loading,
  stacked = false,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="sm:px-2 sm:pb-2.5 sm:pt-1">
      <div className={stacked ? "flex flex-col gap-3" : "flex items-center gap-3 flex-wrap sm:flex-nowrap"}>
        {/* Filters label + results */}
        <div className="flex flex-row items-center gap-2 text-slate-700">
          <div className="flex gap-1 items-center">
            <Filter className="size-3 text-brand" />
            <span className="text-xs font-semibold text-brand">Filters</span>
          </div>
          <span className="ml-auto text-[11px] cursor-text inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7f71f4]/10 to-[#f4a23b]/10 text-[#7f71f4]">
            {loading ? "Loading..." : `${resultCount}/${totalCount} results`}
          </span>
        </div>

        {/* Search name */}
        <div className={stacked ? "flex flex-col w-full" : "flex flex-col flex-1 items-end"}>
          <div className="relative max-w-[260px] w-full">
            <Search className="absolute right-3 z-20 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search Course name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="h-9 text-xs pl-10 pr-2 focus-visible:ring-brand focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Actions (only when advanced is closed) */}
        {!showAdvanced && (
          <div className={`flex flex-col ${stacked ? "items-between" : "items-end ml-auto"}`}>
            <div className="flex items-center justify-between gap-2">
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
              <Button
                variant="outline"
                className="h-9 cursor-pointer -mr-3 text-[11px]"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-label={showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
              >
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="size-4 text-violet-800" />
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <>
          <div className={stacked ? "mt-5 grid grid-cols-1 gap-3" : "mt-5 grid grid-cols-2 md:grid-cols-4 gap-3"}>
            {/* Course code */}
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1 cursor-text">Course code</label>
              <div className="relative max-w-[260px] w-full">
                <Search className="absolute right-3 z-20 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <Input
                  placeholder="Search Course code..."
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  className="h-9 text-xs pl-9 pr-2 focus-visible:ring-brand focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Lecturer */}
            {/* <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1 cursor-text">Lecturer</label>
              <Input
                placeholder="Lecturer name"
                value={lecturerName}
                onChange={(e) => setLecturerName(e.target.value)}
                className="h-9 text-xs focus-visible:ring-brand focus-visible:ring-1"
              />
            </div> */}

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1 cursor-text">Status</label>
              <div className="relative">
                {/* <Tag className="size-3 cursor-pointer text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" /> */}
                <Select<string>
                  value={status ?? ""}
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "1", label: "Pending" },
                    { value: "2", label: "Approved" },
                    { value: "3", label: "Rejected" },
                    { value: "4", label: "Cancelled" },
                  ]}
                  placeholder="All Statuses"
                  onChange={(v) => setStatus(v)}
                  className="h-9 text-xs cursor-pointer rounded-md pl-6 bg-slate-50 w-full"
                />
              </div>
            </div>

            {/* Created after */}
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1 cursor-text">Created After</label>
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
              <label className="text-xs text-slate-500 mb-1 cursor-text">Created Before</label>
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
                    <span className="text-xs text-violet-800">Hide</span>
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
        </>
      )}
    </div>
  );
}
