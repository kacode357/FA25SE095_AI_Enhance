"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVNDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ClassItem } from "../../../../types/class.types";
import CreateEditDialog from "./components/CreateEditDialog";
import FilterRow from "./components/FilterRow";

export default function ClassPage() {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEditId, setOpenEditId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    // New filter states
    const [filterCode, setFilterCode] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterSemester, setFilterSemester] = useState<string>("all");
    const [items, setItems] = useState<ClassItem[]>([]);
    const [sortStudents, setSortStudents] = useState<"asc" | "desc" | null>(null);

    useEffect(() => {
        const now = Date.now();
        const seed: ClassItem[] = [
            { id: crypto.randomUUID(), code: "MKT101", name: "Marketing Basics", semester: "Fall 2025", students: 42, status: "active", createdAt: new Date(now - 86400000 * 5).toISOString(), updatedAt: new Date(now - 86400000 * 2).toISOString() },
            { id: crypto.randomUUID(), code: "FIN202", name: "Corporate Finance", semester: "Fall 2025", students: 35, status: "active", createdAt: new Date(now - 86400000 * 10).toISOString(), updatedAt: new Date(now - 86400000 * 1).toISOString() },
            { id: crypto.randomUUID(), code: "ACC150", name: "Accounting I", semester: "Spring 2025", students: 50, status: "archived", createdAt: new Date(now - 86400000 * 20).toISOString(), updatedAt: new Date(now - 86400000 * 3).toISOString() },
        ];
        setItems(seed);
    }, []);

    const semesters = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => set.add(i.semester));
        return Array.from(set).sort();
    }, [items]);

    const filtered = useMemo(() => {
        const search = query.trim().toLowerCase();
        let res = items.filter((c) => {
            if (search && ![c.code, c.name, c.semester, c.status].some(t => t.toLowerCase().includes(search))) return false;
            if (filterCode.trim()) {
                const codeNeedle = filterCode.trim().toLowerCase();
                if (!c.code.toLowerCase().includes(codeNeedle)) return false;
            }
            if (filterStatus !== "all" && c.status !== filterStatus) return false;
            if (filterSemester !== "all" && c.semester !== filterSemester) return false;
            return true;
        });
        if (sortStudents) {
            res = [...res].sort((a,b) => sortStudents === 'asc' ? a.students - b.students : b.students - a.students);
        }
        return res;
    }, [items, query, filterCode, filterStatus, filterSemester, sortStudents]);

    return (
        <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
            <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                        Create, edit, archive, and track your classes.
                    </p>
                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                        <DialogTrigger asChild>
                            <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                                <Plus className="size-4" />
                                Create Class
                            </Button>
                        </DialogTrigger>
                        <CreateEditDialog
                            title="Create New Class"
                            onSubmit={(data) => {
                                const nowIso = new Date().toISOString();
                                setItems((prev) => [{ id: crypto.randomUUID(), students: 0, createdAt: nowIso, updatedAt: nowIso, ...data }, ...prev]);
                                setOpenCreate(false);
                            }}
                            onCancel={() => setOpenCreate(false)}
                        />
                    </Dialog>
                </div>
            </header>

            <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
                <CardHeader className="flex flex-col gap-3 -mb-5 border-b border-slate-200">
                    <CardTitle className="text-base text-slate-800">
                        Class List Management <span className="text-slate-500">({filtered.length})</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="px-0 flex-1 overflow-hidden">
                    <div className="h-full overflow-auto">
                        <Table className="table-auto w-full">
                            <TableHeader className="sticky top-0 z-10 bg-white">
                                <TableRow className="text-slate-600 border-b border-slate-200">
                                    <TableHead className="w-20 text-center relative py-5 font-bold">
                                        Class Code
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-64 text-center relative py-5 font-bold">
                                        Class Name
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-32 text-center relative py-5 font-bold">
                                        Semester
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-24 text-center relative py-5 font-bold select-none">
                                        <button
                                            type="button"
                                            onClick={() => setSortStudents(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                                            className="inline-flex cursor-pointer items-center gap-1 text-slate-700 hover:text-emerald-600 transition-colors"
                                        >
                                            Students
                                            <span className="text-[10px] font-normal">
                                                {sortStudents === 'asc' && '▲'}
                                                {sortStudents === 'desc' && '▼'}
                                                {!sortStudents && '↕'}
                                            </span>
                                        </button>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-32 text-center relative py-5 font-bold">
                                        Status
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-40 text-center relative py-5 font-bold hidden xl:table-cell">
                                        Created At
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-40 text-center relative py-5 font-bold hidden xl:table-cell">
                                        Updated At
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                                    </TableHead>
                                    <TableHead className="w-40 text-center py-5 font-bold">Actions</TableHead>
                                </TableRow>

                                <FilterRow
                                    filterCode={filterCode} setFilterCode={setFilterCode}
                                    query={query} setQuery={setQuery}
                                    filterSemester={filterSemester} setFilterSemester={setFilterSemester} semesters={semesters}
                                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                                    clearAll={() => { setQuery(""); setFilterCode(""); setFilterStatus("all"); setFilterSemester("all"); }}
                                    resultCount={filtered.length}
                                />
                            </TableHeader>

                            <TableBody>
                                {filtered.map((c) => (
                                    <motion.tr
                                        key={c.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-b border-slate-100 hover:bg-emerald-50/50"
                                    >
                                        <TableCell className="cursor-pointer px-4 font-medium text-slate-900 text-center">{c.code}</TableCell>
                                        <TableCell className="cursor-pointer text-slate-800 px-5">{c.name}</TableCell>
                                        <TableCell className="cursor-pointer text-slate-700 text-center">{c.semester}</TableCell>
                                        <TableCell className="cursor-pointer text-slate-700 text-center">{c.students}</TableCell>
                                        <TableCell className="cursor-pointer text-center">
                                            {c.status === "active" ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Active</Badge>
                                            ) : (
                                                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Archived</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="cursor-pointer text-slate-700 text-center hidden xl:table-cell whitespace-nowrap text-xs">
                                            {formatVNDateTime(c.createdAt)}
                                        </TableCell>
                                        <TableCell className="cursor-pointer text-slate-700 text-center hidden xl:table-cell whitespace-nowrap text-xs">
                                            {formatVNDateTime(c.updatedAt)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Dialog open={openEditId === c.id} onOpenChange={(o) => setOpenEditId(o ? c.id : null)}>
                                                <div className="inline-flex gap-2 justify-center">
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" className="h-8 px-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1">
                                                            <Pencil className="size-4" />
                                                            Edit
                                                        </Button>
                                                    </DialogTrigger>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 px-2 text-red-600 hover:bg-red-50 flex items-center gap-1"
                                                        onClick={() => {
                                                            if (confirm("Delete this class?")) {
                                                                setItems((prev) => prev.filter((i) => i.id !== c.id));
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                                <CreateEditDialog
                                                    title="Edit Class"
                                                    initial={{ code: c.code, name: c.name, semester: c.semester, status: c.status }}
                                                    onSubmit={(data) => {
                                                        setItems((prev) => prev.map((i) => (i.id === c.id ? { ...i, ...data } : i)));
                                                        setOpenEditId(null);
                                                    }}
                                                    onCancel={() => setOpenEditId(null)}
                                                />
                                            </Dialog>
                                        </TableCell>
                                    </motion.tr>
                                ))}

                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                            No classes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
