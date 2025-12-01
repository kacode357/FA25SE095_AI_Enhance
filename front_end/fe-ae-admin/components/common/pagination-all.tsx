"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

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
  const pagesToShow = 5;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + pagesToShow - 1);

  return (
    <div className="w-full flex flex-col items-end border-t border-[var(--border)] bg-white py-4 px-6">
      <Pagination className="w-full flex justify-end">
        <PaginationContent className="flex items-center justify-end gap-2 flex-wrap">
          
          {/* Nút Previous */}
          <PaginationItem>
            <PaginationPrevious
              className={cn(
                // ✅ Thêm cursor-pointer ở đây
                "cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors border border-transparent",
                "text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_8%,#ffffff)] hover:text-[var(--brand-700)]",
                (page <= 1 || loading) && "opacity-50 pointer-events-none"
              )}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            />
          </PaginationItem>

          {/* Danh sách số trang */}
          {Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i).map(
            (p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => !loading && onPageChange(p)}
                  className={cn(
                    // ✅ Thêm cursor-pointer ở đây
                    "cursor-pointer px-3 py-2 text-sm rounded-xl border transition-all duration-200",
                    p === page
                      ? "bg-[color-mix(in_oklab,var(--brand)_10%,#ffffff)] text-[var(--brand)] border-[var(--brand)] font-bold shadow-[0_4px_12px_rgba(127,113,244,0.15)]"
                      : "bg-white text-[var(--text-muted)] border-[var(--border)] hover:bg-[color-mix(in_oklab,var(--brand)_5%,#f8fafc)] hover:border-[color-mix(in_oklab,var(--brand)_30%,var(--border))] hover:text-[var(--brand)]"
                  )}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          {/* Nút Next */}
          <PaginationItem>
            <PaginationNext
              className={cn(
                // ✅ Thêm cursor-pointer ở đây
                "cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors border border-transparent",
                "text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_8%,#ffffff)] hover:text-[var(--brand-700)]",
                (page >= totalPages || loading) && "opacity-50 pointer-events-none"
              )}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Info line */}
      {typeof totalCount === "number" && (
        <p className="text-xs mt-3 text-right text-[var(--text-muted)]">
          Showing page <b className="text-[var(--foreground)]">{page}</b> of{" "}
          <b className="text-[var(--foreground)]">{totalPages || 1}</b> ({totalCount} total items)
        </p>
      )}
    </div>
  );
}