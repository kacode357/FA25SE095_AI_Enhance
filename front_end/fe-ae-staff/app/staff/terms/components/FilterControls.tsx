"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Props {
    filterActive: string;
    setFilterActive: (v: string) => void;
    fetchAll: () => void;
    clearAll: () => void;
    filterStart?: string;
    setFilterStart?: (v: string) => void;
    filterEnd?: string;
    setFilterEnd?: (v: string) => void;
}

export default function FilterControls({
    filterActive,
    setFilterActive,
    fetchAll,
    clearAll,
    filterStart,
    setFilterStart,
    filterEnd,
    setFilterEnd,
}: Props) {
    const [advancedOpen, setAdvancedOpen] = useState(false);
    return (
        <div className="flex flex-col w-full gap-5">
            {/* Top row: status select + advanced toggle (stays in place) */}
            <div className="flex items-center gap-2 ml-auto">
                <select
                    title="Filter"
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="h-10 text-sm w-40 border border-slate-300 rounded-md px-2 bg-white"
                >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <button
                    type="button"
                    aria-expanded={advancedOpen ? "true" : "false"}
                    aria-label="Toggle advanced filters"
                    onClick={() => setAdvancedOpen((s) => !s)}
                    className="inline-flex items-center justify-center cursor-pointer p-2 rounded-md hover:bg-violet-100 hover:text-violet-500"
                >
                    <SlidersHorizontal className={`w-5 h-5 ${advancedOpen ? "text-blue-600" : "text-gray-500"}`} />
                </button>
            </div>

            {/* Advanced filters row (appears below when open) */}
            {advancedOpen && (
                <div className="flex items-center gap-4 justify-between w-full">
                    <div className="flex items-center w-full gap-6">
                            <div className="flex items-center gap-3">
                            <div className="text-xs">Start date</div>
                                <div className="w-64">
                                <DateTimePicker className="border-slate-200 h-8 py-5 text-sm" value={filterStart} onChange={(v) => setFilterStart?.(v)} placeholder="Start date" />
                            </div>
                        </div>

                            <div className="flex items-center gap-3">
                            <div className="text-xs">End date</div>
                                <div className="w-64">
                                <DateTimePicker className="border-slate-200 h-8 py-5 text-sm" value={filterEnd} onChange={(v) => setFilterEnd?.(v)} placeholder="End date" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button className="h-8 bg-green-50 hover:bg-green-100 hover:shadow-md cursor-pointer rounded-xl px-3 text-xs" onClick={fetchAll}>
                            Apply
                        </Button>
                        <Button className="h-8 px-3 bg-slate-50 hover:bg-slate-100 text-black! text-sm cursor-pointer" onClick={clearAll}>
                            Clear
                        </Button>
                    </div>
                    </div>
                )}
                </div>
            )}

