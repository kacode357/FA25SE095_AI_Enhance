"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, Clock, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";
import FilterRow from "./components/FilterRow";

interface AssignmentItem {
  id: string;
  title: string;
  code: string;
  due: string;
  status: "open" | "closed" | "draft";
  submissions: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentPage() {
  const [loading] = useState(false);
  const [items] = useState<AssignmentItem[]>([
    { id: '1', title: 'Market Research Brief', code: 'ASG01', due: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'open', submissions: 12, total: 40, createdAt: "2025-09-10T08:30:00", updatedAt: "2025-09-18T09:15:00" },
    { id: '2', title: 'Financial Ratio Analysis', code: 'ASG02', due: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'draft', submissions: 0, total: 40, createdAt: "2025-09-11T10:00:00", updatedAt: "2025-09-16T14:45:00" },
    { id: '3', title: 'Case Study: Retail Pricing', code: 'ASG03', due: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'closed', submissions: 37, total: 40, createdAt: "2025-09-05T13:20:00", updatedAt: "2025-09-12T11:10:00" },
  ]);

  // Filters
  const [qTitle, setQTitle] = useState("");
  const [qCode, setQCode] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [createdFrom, setCreatedFrom] = useState("");
  const [updatedFrom, setUpdatedFrom] = useState("");

  const filtered = useMemo(() => {
    const cFrom = createdFrom ? new Date(createdFrom).getTime() : null;
    const uFrom = updatedFrom ? new Date(updatedFrom).getTime() : null;
    return items.filter(a => {
      if (qTitle.trim() && !a.title.toLowerCase().includes(qTitle.trim().toLowerCase())) return false;
      if (qCode.trim() && !a.code.toLowerCase().includes(qCode.trim().toLowerCase())) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (overdueOnly && new Date(a.due).getTime() >= Date.now()) return false;
      if (cFrom && new Date(a.createdAt).getTime() < cFrom) return false;
      if (uFrom && new Date(a.updatedAt).getTime() < uFrom) return false;
      return true;
    });
  }, [items, qTitle, qCode, filterStatus, overdueOnly, createdFrom, updatedFrom]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Create, schedule, close and track assignment submissions.
          </p>
          <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
            <Plus className="size-4" />
            New Assignment
          </Button>
        </div>
      </header>

      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-base text-slate-800">
            Assignments Management <span className="text-slate-500">({filtered.length})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No assignments yet" description="Click the create button to add a new assignment." icon={<FileText className='size-10' />} />
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <Table className="table-auto w-full">
                <TableHeader className="sticky top-0 z-10 bg-slate-50">
                  <TableRow className="text-slate-600 border-b border-t border-slate-200">
                    <TableHead className="w-[20%] text-center relative py-5 font-bold">Title
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center relative py-5 font-bold">Code
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center relative py-5 font-bold">Due
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center relative py-5 font-bold">Status
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center relative py-5 font-bold">Progress
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center relative py-5 font-bold hidden xl:table-cell">Created At
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center relative py-5 font-bold hidden xl:table-cell">Updated At
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
                    </TableHead>
                    <TableHead className="text-center py-5 font-bold">Actions</TableHead>
                  </TableRow>
                  <FilterRow
                    qTitle={qTitle} setQTitle={setQTitle}
                    qCode={qCode} setQCode={setQCode}
                    overdueOnly={overdueOnly} setOverdueOnly={setOverdueOnly}
                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                    createdFrom={createdFrom} setCreatedFrom={setCreatedFrom}
                    updatedFrom={updatedFrom} setUpdatedFrom={setUpdatedFrom}
                    resultCount={filtered.length}
                    clearAll={() => { setQTitle(""); setQCode(""); setFilterStatus("all"); setOverdueOnly(false); setCreatedFrom(""); setUpdatedFrom(""); }}
                  />
                </TableHeader>
                <TableBody>
                  {loading && <TableSkeleton rows={5} columns={8} />}
                  {!loading && filtered.map(a => {
                    const due = new Date(a.due);
                    const overdue = due.getTime() < Date.now();
                    return (
                      <TableRow key={a.id} className="border-t cursor-pointer border-slate-100 hover:bg-emerald-50/40">
                        <TableCell className="px-4 py-2 font-medium text-slate-800">{a.title}</TableCell>
                        <TableCell className="px-4 py-2 text-center text-slate-600 font-mono text-xs">{a.code}</TableCell>
                        <TableCell className="pl-15 py-2 text-slate-600 flex items-center gap-1">
                          <CalendarClock className="size-4 text-emerald-600" />
                          <span className="whitespace-nowrap">
                            {due.toLocaleDateString("vi-VN")}{" "}
                            {due.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                          {overdue && <span className='text-[10px] px-1 rounded bg-red-100 text-red-600'>Overdue</span>}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${a.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                              a.status === 'closed' ? 'bg-slate-200 text-slate-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>{a.status}</span>
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right text-slate-600 text-xs">{a.submissions}/{a.total} ({Math.round(a.submissions / a.total * 100)}%)</TableCell>
                        <TableCell className="pr-7 py-2 text-xs text-slate-500 text-right hidden xl:table-cell">{formatDateTime(a.createdAt)}</TableCell>
                        <TableCell className="pr-7 py-2 text-xs text-slate-500 text-right hidden xl:table-cell">{formatDateTime(a.updatedAt)}</TableCell>
                        <TableCell className="px-4 py-2 text-center">
                          <div className="inline-flex gap-2">
                            <Button variant='ghost' className='h-8 px-2 cursor-pointer !bg-emerald-50 text-emerald-700'><Clock className='size-4' /></Button>
                            <Button variant='ghost' className='h-8 px-2 cursor-pointer !bg-blue-50 text-emerald-700'><Pencil className='size-4' /></Button>
                            <Button variant='ghost' className='h-8 px-2 cursor-pointer !bg-red-50 text-red-600'><Trash2 className='size-4' /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
