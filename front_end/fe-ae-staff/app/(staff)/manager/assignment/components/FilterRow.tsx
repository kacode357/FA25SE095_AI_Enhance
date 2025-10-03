"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
    qTitle: string; setQTitle: (v: string) => void;
    qCode: string; setQCode: (v: string) => void;
    overdueOnly: boolean; setOverdueOnly: (v: boolean) => void;
    filterStatus: string; setFilterStatus: (v: string) => void;
    createdFrom: string; setCreatedFrom: (v: string) => void;
    updatedFrom: string; setUpdatedFrom: (v: string) => void;
    resultCount: number; clearAll: () => void;
}

export default function FilterRow({ qTitle, setQTitle, qCode, setQCode, overdueOnly, setOverdueOnly, filterStatus, setFilterStatus, createdFrom, setCreatedFrom, updatedFrom, setUpdatedFrom, resultCount, clearAll }: Props) {
    return (
        <TableRow className="bg-white/95 border-b border-slate-200">
            <TableHead className="p-2">
                <div className="relative">
                    <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        aria-label="Search title"
                        value={qTitle}
                        onChange={(e) => setQTitle(e.target.value)}
                        placeholder="Search title"
                        className="h-8 text-xs !pl-6"
                    />
                </div>
            </TableHead>
            <TableHead className="p-2">
                <Input
                    aria-label="Filter code"
                    value={qCode}
                    onChange={(e) => setQCode(e.target.value)}
                    placeholder="Code"
                    className="h-8 text-xs"
                />
            </TableHead>
            <TableHead className="p-2 text-center align-middle">
                <div className="flex justify-center items-center h-full">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
                        <input
                            type="checkbox"
                            checked={overdueOnly}
                            onChange={(e) => setOverdueOnly(e.target.checked)}
                            className="size-3.5 cursor-pointer"
                            aria-label="Show overdue only"
                        />
                        Overdue only
                    </label>
                </div>
            </TableHead>
            <TableHead className="p-2">
                <select
                    aria-label="Filter status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-8 text-xs w-full cursor-pointer border border-slate-300 rounded-md px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                </select>
            </TableHead>
            <TableHead className="p-2 text-center">
                <div className="text-[10px] text-slate-500"></div>
            </TableHead>
            <TableHead className="p-2 hidden xl:table-cell">
                <Input
                    aria-label="Filter created from date"
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="h-8 text-xs cursor-text"
                />
            </TableHead>
            <TableHead className="p-2 hidden xl:table-cell">
                <Input
                    aria-label="Filter updated from date"
                    type="date"
                    value={updatedFrom}
                    onChange={(e) => setUpdatedFrom(e.target.value)}
                    className="h-8 text-xs cursor-text"
                />
            </TableHead>
            <TableHead className="p-2 text-center align-middle h-12">
                <div className="flex flex-row items-center justify-center gap-2 h-full">
                    <div className="text-[10px] text-slate-500">
                        {resultCount} result{resultCount !== 1 && "s"}
                    </div>
                    <Button
                        variant="ghost"
                        className="h-7 px-2 text-[11px] text-slate-600 !bg-slate-100 hover:bg-slate-300 hover:text-slate-800 transition-colors duration-150"
                        aria-label="Clear filters"
                        onClick={clearAll}
                    >
                        Clear
                    </Button>
                </div>
            </TableHead>
        </TableRow>
    );
}
