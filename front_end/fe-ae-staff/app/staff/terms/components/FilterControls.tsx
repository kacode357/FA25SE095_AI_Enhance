"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";

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
    return (
        <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
                <div className="text-sm">
                    Start date
                </div>
                <div className="w-60 flex flex-row">
                    <DateTimePicker className="border-slate-200" value={filterStart} onChange={(v) => setFilterStart?.(v)} placeholder="Start date" />
                </div>
                <div className="text-sm">
                    End date</div>
                <div className="w-60">
                    <DateTimePicker className="border-slate-200" value={filterEnd} onChange={(v) => setFilterEnd?.(v)} placeholder="End date" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <select
                    title="Filter"
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="h-10 text-sm w-32 border border-slate-300 rounded-md px-2 bg-white"
                >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <Button className="h-8 px-3 text-sm btn btn-gradient-slow" onClick={fetchAll}>
                    Apply
                </Button>
                <Button className="h-8 px-3 text-sm btn btn-gradient-slow" onClick={clearAll}>
                    Clear
                </Button>
            </div>
        </div>
    );
}
