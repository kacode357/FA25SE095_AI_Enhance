"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ClassItem } from "../../../../types/class.types";
import CreateEditDialog from "./components/CreateEditDialog";

export default function ClassPage() {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEditId, setOpenEditId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<ClassItem[]>([]);

    useEffect(() => {
        const raw = sessionStorage.getItem("classes");
        if (raw) {
            try {
                setItems(JSON.parse(raw));
                return;
            } catch {}
        }
        const seed: ClassItem[] = [
            { id: crypto.randomUUID(), code: "MKT101", name: "Marketing Basics", semester: "Fall 2025", students: 42, status: "active" },
            { id: crypto.randomUUID(), code: "FIN202", name: "Corporate Finance", semester: "Fall 2025", students: 35, status: "active" },
            { id: crypto.randomUUID(), code: "ACC150", name: "Accounting I", semester: "Spring 2025", students: 50, status: "archived" },
        ];
        setItems(seed);
    }, []);

    useEffect(() => {
        sessionStorage.setItem("classes", JSON.stringify(items));
    }, [items]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((c) =>
            [c.code, c.name, c.semester, c.status].some((t) => t.toLowerCase().includes(q))
        );
    }, [items, query]);

        return (
            <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
                <header className="sticky top-0 z-20 flex items-center justify-between gap-3 mb-4 bg-white/90 border-b border-slate-200 supports-[backdrop-filter]:backdrop-blur">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Quản lý lớp học</h1>
                        <p className="text-slate-600 text-sm">Tạo, chỉnh sửa, lưu trữ và theo dõi lớp học của bạn.</p>
                    </div>

                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                        <DialogTrigger asChild>
                            <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="size-4" />
                                Tạo lớp học
                            </Button>
                        </DialogTrigger>
                        <CreateEditDialog
                            title="Tạo lớp mới"
                            onSubmit={(data) => {
                                setItems((prev) => [
                                    { id: crypto.randomUUID(), students: 0, ...data },
                                    ...prev,
                                ]);
                                setOpenCreate(false);
                            }}
                            onCancel={() => setOpenCreate(false)}
                        />
                    </Dialog>
                </header>

                <Card className="bg-white border border-slate-200 shadow-sm flex-1 flex flex-col">
                    <CardHeader className="flex flex-col gap-3 border-b border-slate-200 pb-4">
                        <CardTitle className="text-base text-slate-800">
                            Danh sách lớp học <span className="text-slate-500">({filtered.length})</span>
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="relative w-full sm:max-w-xs">
                                <Input
                                    placeholder="Tìm theo mã, tên, kỳ học..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-9"
                                />
                                <Search className="size-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 flex-1 overflow-hidden">
                        <div className="h-full overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-white">
                                    <TableRow className="text-slate-600 border-b border-slate-200">
                                    <TableHead className="px-4">Mã lớp</TableHead>
                                    <TableHead>Tên lớp</TableHead>
                                    <TableHead>Kỳ học</TableHead>
                                    <TableHead>Số SV</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right pr-4">Thao tác</TableHead>
                                    </TableRow>
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
                                        <TableCell className="px-4 font-medium text-slate-900">{c.code}</TableCell>
                                        <TableCell className="text-slate-900">{c.name}</TableCell>
                                        <TableCell className="text-slate-700">{c.semester}</TableCell>
                                        <TableCell className="text-slate-700">{c.students}</TableCell>
                                        <TableCell>
                                            {c.status === "active" ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Đang hoạt động</Badge>
                                            ) : (
                                                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Đã lưu trữ</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <Dialog open={openEditId === c.id} onOpenChange={(o) => setOpenEditId(o ? c.id : null)}>
                                                <div className="inline-flex gap-2">
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" className="h-8 px-2 text-emerald-700 hover:bg-emerald-50">
                                                            <Pencil className="size-4" />
                                                            Sửa
                                                        </Button>
                                                    </DialogTrigger>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 px-2 text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            if (confirm("Xóa lớp này?")) {
                                                                setItems((prev) => prev.filter((i) => i.id !== c.id));
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                                <CreateEditDialog
                                                    title="Chỉnh sửa lớp"
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
                                            Không có lớp nào phù hợp.
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