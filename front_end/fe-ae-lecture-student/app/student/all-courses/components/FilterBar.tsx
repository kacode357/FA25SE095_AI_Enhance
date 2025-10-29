"use client";

import { useState, useMemo } from "react";
import { Filter, Search, RotateCcw, SortAsc } from "lucide-react";

type Props = {
  onFilter: (filters: {
    name?: string;
    lecturerName?: string;
    sortBy?: "CreatedAt" | "Name" | "EnrollmentCount";
  }) => void;
  onReset?: () => void;
};

export default function FilterBar({ onFilter, onReset }: Props) {
  const [name, setName] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [sortBy, setSortBy] = useState<"CreatedAt" | "Name" | "EnrollmentCount">("CreatedAt");

  const canApply = useMemo(() => name.trim() !== "" || lecturerName.trim() !== "" || sortBy !== "CreatedAt", [name, lecturerName, sortBy]);

  const handleApply = () => onFilter({ name, lecturerName, sortBy });
  const handleReset = () => { setName(""); setLecturerName(""); setSortBy("CreatedAt"); onReset?.(); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleApply(); };

  return (
    <div
      className="rounded-2xl shadow-sm"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--border)" }}
    >
      <div className="flex flex-col gap-3 p-3 md:p-4 md:flex-row md:items-center">
        {/* LEFT: 3 fields in grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" style={{ color: "var(--brand)" }} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search by course code..."
              className="input h-10 text-sm"
            />
          </div>

          {/* Lecturer */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: "var(--brand)" }} />
            <input
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Filter by lecturer name..."
              className="input h-10 text-sm"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4" style={{ color: "var(--brand)" }} />
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input h-10 text-sm"
              style={{ minWidth: 180 }}
            >
              <option value="CreatedAt">Newest</option>
              <option value="Name">Name</option>
              <option value="EnrollmentCount">Most Enrolled</option>
            </select>
          </div>
        </div>

        {/* RIGHT: Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button onClick={handleApply} disabled={!canApply} className="btn btn-gradient h-10 px-4 text-sm">
            <Filter className="w-3.5 h-3.5" /> Apply
          </button>
          <button
            onClick={handleReset}
            className="btn h-10 px-4 text-sm"
            style={{ background: "var(--card)", color: "var(--brand)", border: "1px solid var(--brand)" }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
