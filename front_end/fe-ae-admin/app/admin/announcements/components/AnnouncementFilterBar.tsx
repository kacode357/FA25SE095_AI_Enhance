// components/announcements/AnnouncementFilterBar.tsx
"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnnouncementAudience } from "@/types/announcements/announcement.response";

// "any" = không truyền Audience => lấy 0,1,2
export type AudienceFilterValue = "any" | AnnouncementAudience;

export type AnnouncementFilterValue = {
  searchTerm: string;
  audience: AudienceFilterValue;
};

type Props = {
  value: AnnouncementFilterValue;
  onChange: (value: AnnouncementFilterValue) => void;
  className?: string;
};

export default function AnnouncementFilterBar({
  value,
  onChange,
  className,
}: Props) {
  const [searchInput, setSearchInput] = useState(value.searchTerm ?? "");

  // sync lại nếu parent đổi searchTerm (ví dụ reset)
  useEffect(() => {
    setSearchInput(value.searchTerm ?? "");
  }, [value.searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...value,
      searchTerm: searchInput.trim(),
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onChange({
      ...value,
      searchTerm: "",
    });
  };

  const handleAudienceChange = (audience: AudienceFilterValue) => {
    if (audience === value.audience) return;
    onChange({
      ...value,
      audience,
    });
  };

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      {/* Search by title */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm"
      >
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search announcements by title..."
          className="h-8 border-0 p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {value.searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="ml-1 text-[11px] text-blue-600 hover:underline"
          >
            Clear
          </button>
        )}
      </form>

      {/* Filter audience: All (0,1,2) / All users (0) / Students (1) / Lecturers (2) */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Filter by audience:</span>
        <div className="inline-flex rounded-full bg-slate-50 p-1">
          {/* All = không truyền Audience => lấy 3 status */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={clsx(
              "h-7 rounded-full px-3 text-[11px]",
              value.audience === "any"
                ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                : "text-slate-600 hover:text-slate-900"
            )}
            onClick={() => handleAudienceChange("any")}
          >
            All
          </Button>

          {/* All users = Audience = 0 */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={clsx(
              "h-7 rounded-full px-3 text-[11px]",
              value.audience === AnnouncementAudience.All
                ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                : "text-slate-600 hover:text-slate-900"
            )}
            onClick={() => handleAudienceChange(AnnouncementAudience.All)}
          >
            All users
          </Button>

          {/* Students = Audience = 1 */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={clsx(
              "h-7 rounded-full px-3 text-[11px]",
              value.audience === AnnouncementAudience.Students
                ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                : "text-slate-600 hover:text-slate-900"
            )}
            onClick={() =>
              handleAudienceChange(AnnouncementAudience.Students)
            }
          >
            Students
          </Button>

          {/* Lecturers = Audience = 2 */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={clsx(
              "h-7 rounded-full px-3 text-[11px]",
              value.audience === AnnouncementAudience.Lecturers
                ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                : "text-slate-600 hover:text-slate-900"
            )}
            onClick={() =>
              handleAudienceChange(AnnouncementAudience.Lecturers)
            }
          >
            Lecturers
          </Button>
        </div>
      </div>
    </div>
  );
}
