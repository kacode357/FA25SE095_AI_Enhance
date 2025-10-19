"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, RotateCcw } from "lucide-react";

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
  const [sortBy, setSortBy] = useState<
    "CreatedAt" | "Name" | "EnrollmentCount"
  >("CreatedAt");

  const handleApply = () => {
    onFilter({ name, lecturerName, sortBy });
  };

  const handleReset = () => {
    setName("");
    setLecturerName("");
    setSortBy("CreatedAt");
    onReset?.();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* ✅ Left section */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-green-600" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search by course code..."
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-green-600" />
          <Input
            value={lecturerName}
            onChange={(e) => setLecturerName(e.target.value)}
            placeholder="Filter by lecturer name..."
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "CreatedAt" | "Name" | "EnrollmentCount")
            }
            className="h-9 border border-slate-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
          >
            <option value="CreatedAt">Newest</option>
            <option value="Name">Name</option>
            <option value="EnrollmentCount">Most Enrolled</option>
          </select>
        </div>
      </div>

      {/* ✅ Right section (buttons) */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          onClick={handleApply}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Filter className="w-4 h-4 mr-1" />
          Apply
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
