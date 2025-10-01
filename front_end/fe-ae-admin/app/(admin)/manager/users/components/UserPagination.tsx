"use client";

import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

interface UserPaginationProps {
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>; // ✅ Cho phép nhận function updater
}

export default function UserPagination({
  page,
  totalPages,
  setPage,
}: UserPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center px-3 py-2 border-t border-slate-200 bg-slate-50 text-sm">
      <Button
        variant="ghost"
        className="h-8 px-3 text-xs border border-slate-300"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))} // ok
      >
        Prev
      </Button>
      <span className="text-slate-600">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="ghost"
        className="h-8 px-3 text-xs border border-slate-300"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))} // ok
      >
        Next
      </Button>
    </div>
  );
}
