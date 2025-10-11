"use client";
import { TableCell, TableRow } from "@/components/ui/table";

export default function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  const cols = Array.from({ length: columns });
  const rws = Array.from({ length: rows });
  return (
    <>
      {rws.map((_, rIdx) => (
        <TableRow key={rIdx} className="border-b border-slate-100">
          {cols.map((__, cIdx) => (
            <TableCell key={cIdx} className="px-4 py-3">
              <div className="h-3 w-full max-w-[180px] animate-pulse rounded bg-slate-200" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
