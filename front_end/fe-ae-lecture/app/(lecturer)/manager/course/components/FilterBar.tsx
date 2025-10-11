"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search, Users } from "lucide-react";

interface Props {
  filterName: string; setFilterName: (v: string) => void;
  filterCode: string; setFilterCode: (v: string) => void;
  createdAfter: string; setCreatedAfter: (v: string) => void;
  createdBefore: string; setCreatedBefore: (v: string) => void;
  minEnroll: string; setMinEnroll: (v: string) => void;
  maxEnroll: string; setMaxEnroll: (v: string) => void;
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
  minEnroll, setMinEnroll,
  maxEnroll, setMaxEnroll,
  onApply, onClear, resultCount, totalCount, loading
}: Props) {
  return (
    <div className="border border-slate-200 rounded-md p-2 bg-white">
      <div className="flex items-center gap-2 text-slate-600 mb-2">
        <Filter className="size-4" />
        <span className="text-sm">Filters</span>
        <span className="ml-auto text-xs text-slate-500">
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
          <Calendar className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={createdAfter}
            onChange={(e) => setCreatedAfter(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md px-6 bg-white w-full"
            placeholder="Created after"
          />
        </div>

        <div className="relative">
          <Calendar className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={createdBefore}
            onChange={(e) => setCreatedBefore(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md px-6 bg-white w-full"
            placeholder="Created before"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Users className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="number"
              min={0}
              placeholder="Min enroll"
              value={minEnroll}
              onChange={(e) => setMinEnroll(e.target.value)}
              className="h-8 text-xs !pl-6"
            />
          </div>
          <div className="relative">
            <Users className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="number"
              min={0}
              placeholder="Max enroll"
              value={maxEnroll}
              onChange={(e) => setMaxEnroll(e.target.value)}
              className="h-8 text-xs !pl-6"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2">
        <Button variant="ghost" className="h-8 px-2 text-[11px] text-slate-600" onClick={onClear}>
          Clear
        </Button>
        <Button className="h-8 px-3 text-[11px]" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
