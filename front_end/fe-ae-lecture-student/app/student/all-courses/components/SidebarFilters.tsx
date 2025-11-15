"use client";

import { KeyboardEvent } from "react";
import { Filter, Search } from "lucide-react";
import type { TermResponse } from "@/types/term/term.response";

type Props = {
  name: string;
  lecturerName: string;
  selectedTermId: string | null;
  onNameChange: (v: string) => void;
  onLecturerChange: (v: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  onTermToggle: (termId: string) => void;
  terms: TermResponse[];
  termsLoading: boolean;
  termsError: string | null;
};

export default function SidebarFilters({
  name,
  lecturerName,
  selectedTermId,
  onNameChange,
  onLecturerChange,
  onSearchSubmit,
  onReset,
  onTermToggle,
  terms,
  termsLoading,
  termsError,
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

        {/* Search input */}
        <div className="relative mt-1">
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by course code or name..."
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
        <div className="mt-3 space-y-1">
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Lecturer
          </label>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: "var(--brand)" }} />
            <input
              value={lecturerName}
              onChange={(e) => onLecturerChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Filter by lecturer name..."
              className="flex-1 h-9 rounded-lg px-2 text-xs border border-[rgba(0,0,0,0.05)] outline-none focus:ring-1 focus:ring-[var(--brand)] bg-white"
            />
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

        {termsError && !termsLoading && (
          <p className="text-xs" style={{ color: "var(--destructive)" }}>
            {termsError}
          </p>
        )}

        {!termsLoading && !termsError && terms.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No terms available.
          </p>
        )}

        {!termsLoading && !termsError && terms.length > 0 && (
          <ul className="space-y-2">
            {terms.map((term) => {
              const checked = selectedTermId === term.id;
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
                    <span className="flex-1 text-left">{term.name}</span>
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
