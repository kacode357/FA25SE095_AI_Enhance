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
  if (totalPages <= 1) return null;

  const pagesToShow = 5;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + pagesToShow - 1);

  return (
    <div className="w-full flex flex-col items-end border-t border-slate-200 bg-white/80 py-4 px-6">
      {/* ✅ Pagination container — force justify-end */}
      <Pagination className="w-full flex justify-end">
        <PaginationContent className="flex items-center justify-end gap-2 flex-wrap">
          {/* Prev */}
          <PaginationItem>
            <PaginationPrevious
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors",
                (page <= 1 || loading) && "opacity-50 pointer-events-none"
              )}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            />
          </PaginationItem>

          {/* Page numbers */}
          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
            (p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => !loading && onPageChange(p)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-md border transition-colors",
                    p === page
                      ? "bg-green-100 text-green-700 border-green-400 font-semibold"
                      : "hover:bg-slate-100 text-slate-700 border-slate-300"
                  )}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors",
                (page >= totalPages || loading) && "opacity-50 pointer-events-none"
              )}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* ✅ Info line */}
      {typeof totalCount === "number" && (
        <p className="text-xs text-slate-500 mt-2 text-right">
          Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total items)
        </p>
      )}
    </div>
  );
}
