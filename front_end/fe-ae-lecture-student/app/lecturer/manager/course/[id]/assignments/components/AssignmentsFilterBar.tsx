// app/lecture/manager/course/[id]/assignments/components/AssignmentsFilterBar.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-xl border p-4 space-y-4 bg-white">
      {/* Row 1: Search + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-slate-600 mb-1">Search</div>
          <Input
            placeholder="Title or description…"
            value={search}
            onChange={(e) => onChange({ search: e.target.value })}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="text-xs text-slate-600 mb-1">Status</div>
          <div className="flex flex-wrap gap-3 rounded-md border p-3">
            {ALL_STATUS.map(({ value: st, label }) => (
              <label key={st} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={!!statuses[st]}
                  onCheckedChange={(v) => onChange({ statuses: { ...statuses, [st]: !!v } })}
                />
                <span>{label}</span>
              </label>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => onChange({ statuses: {} })}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Group type + Dates + Quick toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-slate-600 mb-1">Type</div>
          <Select
            value={groupType}
            onValueChange={(v: string) =>
              onChange({ groupType: (v as "all" | "group" | "individual") })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="group">Group assignments</SelectItem>
                <SelectItem value="individual">Individual assignments</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-xs text-slate-600 mb-1">Due from</div>
          <Input
            type="date"
            value={dueFrom}
            onChange={(e) => onChange({ dueFrom: e.target.value })}
          />
        </div>
        <div>
          <div className="text-xs text-slate-600 mb-1">Due to</div>
          <Input
            type="date"
            value={dueTo}
            onChange={(e) => onChange({ dueTo: e.target.value })}
          />
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isUpcoming}
              onCheckedChange={(v) => onChange({ isUpcoming: !!v })}
            />
            Upcoming (7 days)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isOverdue}
              onCheckedChange={(v) => onChange({ isOverdue: !!v })}
            />
            Overdue
          </label>
        </div>
      </div>

      {/* Row 3: Sort + Page size + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Sort by</span>
          <Select
            value={sortBy ?? "DueDate"}
            onValueChange={(v: string) =>
              onChange({ sortBy: (v as NonNullable<GetAssignmentsQuery["sortBy"]>) })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DueDate">DueDate</SelectItem>
              <SelectItem value="Title">Title</SelectItem>
              <SelectItem value="CreatedAt">CreatedAt</SelectItem>
              <SelectItem value="Status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder ?? "asc"}
            onValueChange={(v: string) =>
              onChange({ sortOrder: (v as "asc" | "desc") })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">asc</SelectItem>
              <SelectItem value="desc">desc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Page size</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v: string) => onChange({ pageSize: parseInt(v, 10) || 10 })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" className="ml-auto" onClick={onReset} disabled={loading}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
