    "use client";

    import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ClassItem } from "../../../../types/class.types";
import FilterToolbar from "../components/FilterToolbar";
import ClassCard from "./components/ClassCard";
import CreateEditDialog from "./components/CreateEditDialog";

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
                res = [...res].sort((a, b) => sortStudents === 'asc' ? a.students - b.students : b.students - a.students);
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
                    <CardHeader className="flex flex-col">
                        <CardTitle className="text-base text-slate-800">
                            Class List Management <span className="text-slate-500">({filtered.length})</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-0 flex-1 overflow-hidden">
                        <FilterToolbar
                            rightSlot={
                                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                    <span>{filtered.length} result{filtered.length !== 1 && 's'}</span>
                                    <button
                                        type="button"
                                        className="h-7 px-2 rounded bg-slate-100 hover:bg-slate-200"
                                        onClick={() => { setQuery(""); setFilterCode(""); setFilterStatus("all"); setFilterSemester("all"); }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            }
                        >
                            <input
                                placeholder="Search name / code / …"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-8 w-full sm:w-64 text-xs rounded-md border border-slate-300 px-2"
                            />
                            <input
                                placeholder="Code"
                                value={filterCode}
                                onChange={(e) => setFilterCode(e.target.value)}
                                className="h-8 w-full sm:w-32 text-xs rounded-md border border-slate-300 px-2"
                            />
                            <select
                                aria-label="Filter by semester"
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2 bg-white"
                            >
                                <option value="all">All semesters</option>
                                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                aria-label="Filter by status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2 bg-white"
                            >
                                <option value="all">All status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                            <button
                                type="button"
                                className="h-8 px-2 text-xs rounded bg-slate-100 hover:bg-slate-200"
                                onClick={() => setSortStudents(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                                title="Sort by students"
                            >
                                Students {sortStudents === 'asc' ? '▲' : sortStudents === 'desc' ? '▼' : '↕'}
                            </button>
                        </FilterToolbar>

                        <div className="p-3">
                            {filtered.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">No classes found.</div>
                            ) : (
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {filtered.map((c) => (
                                        <motion.div key={c.id} initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.2}}>
                                            <Dialog open={openEditId === c.id} onOpenChange={(o) => setOpenEditId(o ? c.id : null)}>
                                                <ClassCard
                                                    item={c}
                                                    onEdit={() => { /* open dialog */ setOpenEditId(c.id); }}
                                                    onDelete={() => {
                                                        if (confirm("Delete this class?")) setItems(prev => prev.filter(i => i.id !== c.id));
                                                    }}
                                                />
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
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
