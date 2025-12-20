// app/student/all-courses/components/SidebarFilters.tsx
"use client";

import { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import type { TermResponse } from "@/types/term/term.response";
import type { LecturerItem } from "@/types/lecturers/lecturer.response";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";

type Props = {
  courseCode: string;
  lecturerName: string;
  selectedTermId: string | null;
  onCourseCodeChange: (v: string) => void;
  onLecturerChange: (v: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  onTermToggle: (termId: string) => void;
  terms: TermResponse[];
  termsLoading: boolean;

  // lecturer suggestion
  lecturers: LecturerItem[];
  lecturersLoading: boolean;
  onLecturerSuggestionClick: (name: string) => void;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  if (dateStr.startsWith("0001")) return "";
  return formatDateOnlyVN(dateStr);
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SidebarFilters({
  courseCode,
  lecturerName,
  selectedTermId,
  onCourseCodeChange,
  onLecturerChange,
  onSearchSubmit,
  onReset,
  onTermToggle,
  terms,
  termsLoading,
  lecturers,
  lecturersLoading,
  onLecturerSuggestionClick,
}: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearchSubmit();
  };

  return (
    <div className="space-y-5">
      {/* Search card */}
      <section
        className="rounded-2xl p-5 shadow-sm space-y-3"
        style={{
          background: "rgba(252,249,255,0.95)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--nav)" }}>
          Search Courses
        </h2>

        {/* Search input (course code only) */}
        <div className="relative mt-1">
          <input
            value={courseCode}
            onChange={(e) => onCourseCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by course code..."
            className="w-full h-11 rounded-xl pl-4 pr-10 text-sm border border-[rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent bg-white"
          />
          <button
            type="button"
            onClick={onSearchSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "var(--brand)", color: "white" }}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Lecturer filter */}
        <div className="mt-3 space-y-2">
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Lecturer
          </label>
          <input
            value={lecturerName}
            onChange={(e) => onLecturerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Filter by lecturer name..."
            className="w-full h-9 rounded-lg px-2 text-xs border border-[rgba(0,0,0,0.05)] outline-none focus:ring-1 focus:ring-[var(--brand)] bg-white"
          />

          {/* Suggested lecturers (vertical list) */}
          <div className="mt-2 space-y-2">
            <p
              className="text-[11px] font-medium uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Suggested lecturers
            </p>

            {lecturersLoading && (
              <p className="text-[11px]" style={{ color: "var(--brand)" }}>
                Loading lecturers...
              </p>
            )}

            {!lecturersLoading && lecturers.length === 0 && (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                No lecturers found.
              </p>
            )}

            {!lecturersLoading && lecturers.length > 0 && (
              <ul className="space-y-1">
                {lecturers.map((lec) => {
                  const initials = getInitials(lec.fullName);
                  return (
                    <li key={lec.id}>
                      <button
                        type="button"
                        onClick={() => onLecturerSuggestionClick(lec.fullName)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition hover:bg-white/80 border border-transparent hover:border-[var(--brand)]"
                      >
                        {/* avatar - TAO ĐÃ SỬA Ở ĐÂY */}
                        <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-[var(--brand)] text-white text-[11px] font-semibold shrink-0 ring-2 ring-white">
                          {lec.profilePictureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={lec.profilePictureUrl}
                              alt={lec.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>

                        {/* full name */}
                        <span
                          className="truncate text-[12px] text-left"
                          style={{ color: "var(--foreground)" }}
                        >
                          {lec.fullName}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Reset button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 text-xs font-medium"
            style={{ color: "var(--brand)" }}
          >
            Reset filters
          </button>
        </div>
      </section>

      {/* Term (Category) card */}
      <section
        className="rounded-2xl p-5 shadow-sm space-y-4"
        style={{
          background: "rgba(252,249,255,0.95)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: "var(--nav)" }}>
          Term
        </h2>

        {termsLoading && (
          <p className="text-xs" style={{ color: "var(--brand)" }}>
            Loading terms...
          </p>
        )}

        {!termsLoading && terms.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No terms available.
          </p>
        )}

        {!termsLoading && terms.length > 0 && (
          <ul className="space-y-2">
            {terms.map((term) => {
              const checked = selectedTermId === term.id;
              const start = formatDate(term.startDate);
              const end = formatDate(term.endDate);
              const hasRange = !!(start || end);

              return (
                <li key={term.id}>
                  <button
                    type="button"
                    onClick={() => onTermToggle(term.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition"
                    style={{
                      background: checked ? "rgba(93, 80, 255, 0.06)" : "transparent",
                      color: checked ? "var(--brand)" : "var(--foreground)",
                      border: checked
                        ? "1px solid rgba(93, 80, 255, 0.35)"
                        : "1px solid transparent",
                    }}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded border"
                      style={{
                        borderColor: checked ? "var(--brand)" : "rgba(0,0,0,0.2)",
                        background: checked ? "var(--brand)" : "transparent",
                      }}
                    >
                      {checked && <span className="h-2 w-2 rounded-sm bg-white" />}
                    </span>

                    <span className="flex-1 text-left">
                      {term.name}
                      {hasRange && (
                        <span
                          className="ml-1 text-[11px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          (
                          {start || "N/A"}
                          {end && ` - ${end}`}
                          )
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
