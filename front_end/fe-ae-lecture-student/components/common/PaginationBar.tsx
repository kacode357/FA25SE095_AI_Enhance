"use client";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalCount?: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({
  page,
  totalPages,
  totalCount,
  loading = false,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pagesToShow = 5;
  const half = Math.floor(pagesToShow / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + pagesToShow - 1);
  if (end - start + 1 < pagesToShow) start = Math.max(1, end - pagesToShow + 1);

  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;

  return (
    <div className="w-full flex flex-col items-end border-t border-[var(--border)] bg-white/80 py-4 px-6">
      <nav aria-label="Pagination" className="w-full flex justify-end">
        <ul className="flex items-center justify-end gap-2 flex-wrap">
          <li>
            <button
              type="button"
              className={`btn bg-white border border-brand text-nav hover:text-nav-active px-3 py-2 text-sm ${
                !canPrev ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={!canPrev}
            >
              Prev
            </button>
          </li>

          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => {
            const active = p === page;
            return (
              <li key={p}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => !loading && onPageChange(p)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    active
                      ? "bg-[var(--brand)] text-white border-brand font-semibold shadow-sm"
                      : "bg-white text-nav border-[var(--border)] hover:text-nav-active"
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {p}
                </button>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              className={`btn bg-white border border-brand text-nav hover:text-nav-active px-3 py-2 text-sm ${
                !canNext ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={!canNext}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      {typeof totalCount === "number" && (
        <p className="text-xs text-[var(--text-muted)] mt-2 text-right">
          Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total items)
        </p>
      )}
    </div>
  );
}
