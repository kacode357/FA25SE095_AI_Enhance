"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { EmptyState } from "../empty/EmptyState";

export interface Column<T> { key: keyof T | string; header: string; className?: string; render?: (row: T) => ReactNode; }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; emptyMessage?: string; rowKey: (row: T) => string; }

export function DataTable<T>({ columns, data, loading, emptyMessage = "No data", rowKey }: DataTableProps<T>) {
  return (
    <div className="relative w-full overflow-auto">
      <Table className="w-full">
        <TableHeader className="sticky top-0 z-10 bg-slate-50">
          <TableRow className="border-y border-slate-200">
            {columns.map(c => (
              <TableHead key={String(c.key)} className={`text-slate-600 font-semibold ${c.className || ""}`}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-slate-500 text-sm">Loading...</TableCell>
            </TableRow>
          )}
          {!loading && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0"><EmptyState message={emptyMessage} /></TableCell>
            </TableRow>
          )}
          <AnimatePresence>
            {!loading && data.map(row => (
              <motion.tr key={rowKey(row)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} className="border-b border-slate-100 hover:bg-slate-50">
                {columns.map(c => (
                  <TableCell key={String(c.key)} className={c.className}>{c.render ? c.render(row) : (row as any)[c.key]}</TableCell>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
