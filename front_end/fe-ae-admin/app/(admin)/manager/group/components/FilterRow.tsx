"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
    qName: string; setQName: (v: string) => void;
    qLeader: string; setQLeader: (v: string) => void;
    minMembers: string; setMinMembers: (v: string) => void;
    maxMembers: string; setMaxMembers: (v: string) => void;
    filterStatus: string; setFilterStatus: (v: string) => void;
    createdFrom: string; setCreatedFrom: (v: string) => void;
    updatedFrom: string; setUpdatedFrom: (v: string) => void;
    resultCount: number; clearAll: () => void;
}

export default function FilterRow({ qName, setQName, qLeader, setQLeader, minMembers, setMinMembers, maxMembers, setMaxMembers, filterStatus, setFilterStatus, createdFrom, setCreatedFrom, updatedFrom, setUpdatedFrom, resultCount, clearAll }: Props) {
    return (
        <TableRow className="bg-white/95 border-b border-slate-200">
            <TableHead className="p-2">
                <div className="relative">
                    <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        placeholder="Search group name"
                        aria-label="Search group name"
                        value={qName}
                        onChange={(e) => setQName(e.target.value)}
                        className="h-8 text-xs !pl-6"
                    />
                </div>
            </TableHead>
            <TableHead className="p-2">
                <Input
                    placeholder="Leader name"
                    aria-label="Leader name"
                    value={qLeader}
                    onChange={(e) => setQLeader(e.target.value)}
                    className="h-8 text-xs"
                />
            </TableHead>
            <TableHead className="p-2">
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        aria-label="Min members"
                        value={minMembers}
                        onChange={(e) => setMinMembers(e.target.value)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        aria-label="Max members"
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
            </TableHead>
            <TableHead className="p-2">
                <select
                    aria-label="Filter status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-8 cursor-pointer text-xs border border-slate-300 rounded-md px-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                </select>
            </TableHead>
            <TableHead className="p-2 hidden xl:table-cell">
                <Input
                    type="date"
                    aria-label="Filter created from date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="h-8 text-xs cursor-text"
                />
            </TableHead>
            <TableHead className="p-2 hidden xl:table-cell">
                <Input
                    type="date"
                    aria-label="Filter updated from date"
                    value={updatedFrom}
                    onChange={(e) => setUpdatedFrom(e.target.value)}
                    className="h-8 text-xs cursor-text"
                />
            </TableHead>
            <TableHead className="p-2 text-center">
                <div className="flex items-center justify-center gap-2">
                    <div className="text-[10px] text-slate-500">{resultCount} result{resultCount !== 1 && "s"}</div>
                    <Button
                        variant="ghost"
                        className="h-7 px-2 text-[11px] text-slate-600 !bg-slate-100 hover:bg-slate-300 hover:text-slate-800 transition-colors duration-150"
                        onClick={clearAll}
                    >
                        Clear
                    </Button>
                </div>
            </TableHead>
        </TableRow>
    );
}
