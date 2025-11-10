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
import { Separator } from "@/components/ui/separator";
import type { AssignmentStatusFilter, GetAssignmentsQuery } from "@/types/assignments/assignment.payload";

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
};

const ALL_STATUS: { value: AssignmentStatusFilter; label: string }[] = [
  { value: 0, label: "Draft" },
  { value: 1, label: "Active" },
  { value: 2, label: "Extended" },
  { value: 3, label: "Overdue" },
  { value: 4, label: "Closed" },
];

export default function AssignmentsFilterBar({ value, loading, onChange, onReset }: Props) {
  const { search, statuses, groupType, dueFrom, dueTo, isUpcoming, isOverdue, sortBy, sortOrder, pageSize } = value;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
      {/* Row 1: Search + Status */}
      <div className="space-y-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-700">Search & Status</h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-700"
            onClick={() => onChange({ statuses: {} })}
          >
            Clear
          </Button>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col justify-between">
            <div className="col-span-1">
              <Input
                className="text-sm min-w-[240px]"
                placeholder="Title or description..."
                value={search}
                onChange={(e) => onChange({ search: e.target.value })}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            {ALL_STATUS.map(({ value: st, label }) => (
              <label
                key={st}
                className={`flex items-center gap-1 px-3 py-1 border rounded-full text-xs cursor-pointer transition ${statuses[st]
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
              >
                <Checkbox
                  checked={!!statuses[st]}
                  onCheckedChange={(v) =>
                    onChange({ statuses: { ...statuses, [st]: !!v } })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-xs text-slate-600 mb-1">Type</div>
            <Select
              value={groupType}
              onValueChange={(v: string) =>
                onChange({ groupType: v as "all" | "group" | "individual" })
              }
            >
              <SelectTrigger className="border-slate-200 w-40 text-sm">
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
        </div>
      </div>

      <Separator />

      {/* Row 2: Type + Date range + Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <div className="text-xs text-slate-600 mb-1">Due from</div>
          <Input
            type="date"
            className="text-sm"
            value={dueFrom}
            onChange={(e) => onChange({ dueFrom: e.target.value })}
          />
        </div>

        <div>
          <div className="text-xs text-slate-600 mb-1">Due to</div>
          <Input
            type="date"
            className="text-sm"
            value={dueTo}
            onChange={(e) => onChange({ dueTo: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
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

      <Separator />

      {/* Row 3: Sort + Page size + Reset */}
      <div className="flex flex-col md:flex-col md:items-start md:justify-between gap-3">
          <div className="flex justify-between gap-3">
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-600">Sort by</span>
              <Select
                value={sortBy ?? "DueDate"}
                onValueChange={(v: string) =>
                  onChange({ sortBy: v as NonNullable<GetAssignmentsQuery["sortBy"]> })
                }
              >
                <SelectTrigger className="w-[150px] border-slate-200 text-sm">
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
                <SelectTrigger className="w-[130px] border-slate-200 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-slate-600">Page size</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v: string) => onChange({ pageSize: parseInt(v, 10) })}
            >
              <SelectTrigger className="w-[130px] border-slate-200 text-sm">
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

        {/* <Button variant="outline" size="sm" onClick={onReset} disabled={loading}>
          Reset filters
        </Button> */}
      </div>
  );
}
