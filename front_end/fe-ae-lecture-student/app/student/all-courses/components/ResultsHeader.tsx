"use client";

type SortBy = "CreatedAt" | "Name" | "EnrollmentCount";

type Props = {
  total: number;
  page: number;
  pageSize: number;
  sortBy: SortBy;
  onSortChange: (v: SortBy) => void;
};

export default function ResultsHeader({
  total,
  page,
  pageSize,
  sortBy,
  onSortChange,
}: Props) {
  const hasResults = total > 0;
  const from = hasResults ? (page - 1) * pageSize + 1 : 0;
  const to = hasResults ? Math.min(page * pageSize, total) : 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {hasResults ? (
          <>
            Showing{" "}
            <span className="font-semibold" style={{ color: "var(--nav)" }}>
              {from}-{to}
            </span>{" "}
            of{" "}
            <span className="font-semibold" style={{ color: "var(--nav)" }}>
              {total}
            </span>{" "}
            Results
          </>
        ) : (
          <>Showing 0 Results</>
        )}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Sort by:
        </span>
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as "CreatedAt" | "Name" | "EnrollmentCount")
          }
          className="h-10 rounded-xl border border-[rgba(0,0,0,0.05)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]"
          style={{ minWidth: 180 }}
        >
          <option value="CreatedAt">Newest</option>
          <option value="Name">Name</option>
          <option value="EnrollmentCount">Most Enrolled</option>
        </select>
      </div>
    </div>
  );
}
