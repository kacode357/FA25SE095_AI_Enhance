// app/lecture/manager/course/[id]/assignments/components/AssignmentsFilterBar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssignmentStatusFilter, GetAssignmentsQuery } from "@/types/assignments/assignment.payload";
import { Calendar, Filter, GitPullRequestClosed, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export type FilterState = {
  search: string;
  statuses: Record<number, boolean>;
  groupType: "all" | "group" | "individual";
  dueFrom: string; // yyyy-MM-dd
  dueTo: string;   // yyyy-MM-dd
  isUpcoming: boolean;
  isOverdue: boolean;
  sortBy: NonNullable<GetAssignmentsQuery["sortBy"]>;
  sortOrder: NonNullable<GetAssignmentsQuery["sortOrder"]>;
  pageSize: number;
};

type Props = {
  value: FilterState;
  loading?: boolean;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  resultCount?: number; // number of items in current page
  totalCount?: number;  // total with current filters
};

const ALL_STATUS: { value: AssignmentStatusFilter; label: string }[] = [
  { value: 1, label: "Draft" },
  { value: 2, label: "Scheduled" },
  { value: 3, label: "Active" },
  { value: 4, label: "Extended" },
  { value: 5, label: "Overdue" },
  { value: 6, label: "Closed" },
  { value: 7, label: "Graded" },
];

export default function AssignmentsFilterBar({ value, loading, onChange, onReset, resultCount = 0, totalCount = 0 }: Props) {
  const { search, statuses, groupType, dueFrom, dueTo, isUpcoming, isOverdue, sortBy, sortOrder, pageSize } = value;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="sm:px-4 sm:py-2.5">
      {/* Top row following Course FilterBar style */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex flex-row items-center gap-2 text-slate-700">
          <div className="flex gap-1 items-center">
            <Filter className="size-3 text-brand" />
            <span className="text-xs font-semibold text-brand">Filters</span>
          </div>
          <span className="ml-auto text-[11px] cursor-text inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7f71f4]/10 to-[#f4a23b]/10 text-[#7f71f4]">
            {loading ? "Loading..." : `${resultCount}/${totalCount} results`}
          </span>
        </div>
        <div className="flex flex-col flex-1 items-end">
          <div className="relative max-w-[360px] w-full">
            <Search className="absolute right-3 z-20 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search assignments (title or description)..."
              value={search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="h-9 text-xs pl-9 pr-2 focus-visible:ring-brand focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Actions when Advanced closed */}
        {!showAdvanced && (
          <div className="flex flex-col items-end ml-auto">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Button
                  variant="ghost"
                  className="h-9 cursor-pointer px-2 text-[11px] text-[#000D83] hover:text-brand"
                  onClick={onReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
              <Button
                variant="outline"
                className="h-9 cursor-pointer -mr-3 text-[11px]"
                onClick={() => setShowAdvanced(true)}
              >
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="size-4 text-violet-800" />
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced section */}
      {showAdvanced && (
        <div className="mt-3 space-y-6">
          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            {ALL_STATUS.map(({ value: st, label }) => (
              <label
                key={st}
                className={`flex items-center gap-1 px-3 py-1 border rounded-full text-xs cursor-pointer transition ${statuses[st]
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"}`}
              >
                <Checkbox
                  checked={!!statuses[st]}
                  onCheckedChange={(v) => onChange({ statuses: { ...statuses, [st]: !!v } })}
                />
                {label}
              </label>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-700"
              onClick={() => onChange({ statuses: {} })}
            >
              Clear Status
            </Button>
          </div>

          {/* Grid: Type + Dates + Flags */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">Type</span>
              <Select
                value={groupType}
                onValueChange={(v: string) =>
                  onChange({ groupType: v as "all" | "group" | "individual" })
                }
              >
                <SelectTrigger className="border-slate-200 bg-white w-full h-9 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">Due from</span>
              <div className="relative">
                <Calendar className="size-3 cursor-pointer text-brand absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  placeholder="Select date"
                  title="Due from"
                  aria-label="Due from date"
                  value={dueFrom}
                  onChange={(e) => onChange({ dueFrom: e.target.value })}
                  className="h-9 text-xs border border-slate-300 cursor-text rounded-md px-6 bg-white w-full focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">Due to</span>
              <div className="relative">
                <Calendar className="size-3 cursor-pointer text-brand absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  placeholder="Select date"
                  title="Due to"
                  aria-label="Due to date"
                  value={dueTo}
                  onChange={(e) => onChange({ dueTo: e.target.value })}
                  className="h-9 text-xs border border-slate-300 cursor-text rounded-md px-6 bg-white w-full focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="flex flex-row gap-10">
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={isUpcoming}
                  onCheckedChange={(v) => onChange({ isUpcoming: !!v })}
                />
                Upcoming (7 days)
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={isOverdue}
                  onCheckedChange={(v) => onChange({ isOverdue: !!v })}
                />
                Overdue
              </label>
            </div>
          </div>

          {/* Sort & Page size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-600">Sort by</span>
              <Select
                value={sortBy ?? "DueDate"}
                onValueChange={(v: string) =>
                  onChange({ sortBy: v as NonNullable<GetAssignmentsQuery["sortBy"]> })
                }
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
                  <SelectItem value="DueDate">DueDate</SelectItem>
                  <SelectItem value="Title">Title</SelectItem>
                  <SelectItem value="CreatedAt">CreatedAt</SelectItem>
                  <SelectItem value="Status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-600">Order</span>
              <Select
                value={sortOrder ?? "asc"}
                onValueChange={(v: string) => onChange({ sortOrder: v as "asc" | "desc" })}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-600">Page size</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v: string) => onChange({ pageSize: parseInt(v, 10) })}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bottom actions when advanced open */}
          <div className="mt-4 pt-3 border-t border-slate-200 text-right">
            <div className="flex gap-2 justify-end">
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
              <Button
                variant="ghost"
                className="h-9 cursor-pointer px-2 text-[11px] text-[#000D83] hover:text-brand"
                onClick={onReset}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
