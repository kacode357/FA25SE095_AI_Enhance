"use client";

import React from "react";

export function Table<T>({
    headers,
    rows,
    renderRow,
    emptyText,
}: {
    headers: string[];
    rows: T[];
    renderRow: (row: T, idx: number) => React.ReactNode;
    emptyText: string;
}) {
    return (
        <div className="overflow-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-gray-50">
                        {headers.map((h, i) => (
                            <th key={i} className="text-left p-3 font-semibold text-gray-700">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className="p-4 text-gray-500" colSpan={headers.length}>
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((r, i) => renderRow(r, i))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
