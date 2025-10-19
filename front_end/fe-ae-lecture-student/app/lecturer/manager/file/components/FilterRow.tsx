"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Props {
    qName: string; setQName: (v: string) => void;
    typeFilter: string; setTypeFilter: (v: string) => void;
    ownerFilter: string; setOwnerFilter: (v: string) => void;
    uploadedFrom: string; setUploadedFrom: (v: string) => void;
    uploadedTo: string; setUploadedTo: (v: string) => void;
    resultCount: number; clearAll: () => void;
}

export default function FilterRow({ qName, setQName, typeFilter, setTypeFilter, ownerFilter, setOwnerFilter, uploadedFrom, setUploadedFrom, uploadedTo, setUploadedTo, resultCount, clearAll }: Props) {
    return (
        <TableRow className="bg-white/95 border-b border-slate-200">
            <TableHead className="p-2">
                <div className="relative">
                    <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        aria-label="Search filename"
                        value={qName}
                        onChange={(e) => setQName(e.target.value)}
                        placeholder="Search filename"
                        className="h-8 text-xs !pl-6"
                    />
                </div>
            </TableHead>
            <TableHead className="p-2">
                <select
                    aria-label="Filter type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-8 text-xs cursor-pointer w-full border border-slate-300 rounded-md px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">All</option>
                    <option value="pdf">PDF</option>
                    <option value="xlsx">XLSX</option>
                    <option value="docx">DOCX</option>
                </select>
            </TableHead>
            <TableHead className="p-2">
                <div className="text-[10px] text-slate-500"></div>
            </TableHead>
            <TableHead className="p-2">
                <select
                    aria-label="Filter owner"
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="h-8 text-xs cursor-pointer w-full border border-slate-300 rounded-md px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">All</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Student">Student</option>
                </select>
            </TableHead>
            <TableHead className="p-2 hidden xl:table-cell">
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        aria-label="Uploaded from date"
                        value={uploadedFrom}
                        onChange={(e) => setUploadedFrom(e.target.value)}
                        className="h-8 text-xs cursor-text"
                    />
                    <Input
                        type="date"
                        aria-label="Uploaded to date"
                        value={uploadedTo}
                        onChange={(e) => setUploadedTo(e.target.value)}
                        className="h-8 text-xs cursor-text"
                    />
                </div>
            </TableHead>
            <TableHead className="p-2 text-center align-middle h-12">
                <div className="flex flex-row items-center justify-center gap-2 h-full">
                    <div className="text-[10px] text-slate-500">
                        {resultCount} result{resultCount !== 1 && "s"}
                    </div>
                    <Button
                        variant="ghost"
                        onClick={clearAll}
                        className="h-7 px-2 cursor-pointer text-[11px] text-slate-600 !bg-slate-100 hover:bg-slate-300 hover:text-slate-800 transition-colors duration-150"
                        aria-label="Clear filters"
                    >
                        Clear
                    </Button>
                </div>
            </TableHead>
        </TableRow>
    );
}
