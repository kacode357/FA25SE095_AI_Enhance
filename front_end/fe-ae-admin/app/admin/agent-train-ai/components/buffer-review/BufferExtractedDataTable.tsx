"use client";

import React from "react";

interface BufferExtractedDataTableProps {
  rows: Record<string, any>[];
  maxHeight?: string;
}

export const BufferExtractedDataTable: React.FC<
  BufferExtractedDataTableProps
> = ({ rows, maxHeight = "22rem" }) => {
  const columns = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
    });
    return Array.from(set);
  }, [rows]);

  const renderCell = (row: Record<string, any>, column: string) => {
    const value = row?.[column];
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return value;
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">
          Extracted Data
        </h4>
        <span className="text-[11px] text-slate-500">{rows.length} rows</span>
      </div>
      <div
        className="mt-2 overflow-auto rounded-xl border border-slate-200"
        style={{ maxHeight }}
      >
        <div className="min-w-full">
          <table className="min-w-full table-auto text-left text-[11px] text-slate-700">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-slate-50/60">
                  {columns.map((column) => (
                    <td key={column} className="px-3 py-2">
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
