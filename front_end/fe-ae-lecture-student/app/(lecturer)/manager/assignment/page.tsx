"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import EmptyState from "../components/EmptyState";
import FilterToolbar from "../components/FilterToolbar";
import AssignmentCard from "./components/AssignmentCard";
import NewAssignmentDialog from "./components/NewAssignmentDialog";

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
  const [items, setItems] = useState<AssignmentItem[]>([
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

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Create, schedule, close and track assignment submissions.
          </p>
          <div className="flex items-center gap-2">
            <NewAssignmentDialog onCreate={(a) => { /* local-only add */ setItems(prev => [a as AssignmentItem, ...prev]); }} />
            <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
              <Plus className="size-4" />
              New Assignment
            </Button>
          </div>
        </div>
      </header>
      <Breadcrumbs items={[{ label: 'Manager', href: '/manager' }, { label: 'Assignments', href: '/manager/assignment' }]} />

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
            <>
              <FilterToolbar
                rightSlot={
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span>{filtered.length} result{filtered.length !== 1 && 's'}</span>
                    <button
                      type="button"
                      className="h-7 px-2 rounded bg-slate-100 hover:bg-slate-200"
                      onClick={() => { setQTitle(""); setQCode(""); setFilterStatus("all"); setOverdueOnly(false); setCreatedFrom(""); setUpdatedFrom(""); }}
                    >
                      Clear
                    </button>
                  </div>
                }
              >
                <input
                  placeholder="Search title"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="h-8 w-full sm:w-64 text-xs rounded-md border border-slate-300 px-2"
                />
                <input
                  placeholder="Code"
                  value={qCode}
                  onChange={(e) => setQCode(e.target.value)}
                  className="h-8 w-full sm:w-32 text-xs rounded-md border border-slate-300 px-2"
                />
                <label className="inline-flex items-center gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} className="size-3.5" />
                  Overdue only
                </label>
                <select
                  aria-label="Filter status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2 bg-white"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
                <input aria-label="Filter created from date" type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
                <input aria-label="Filter updated from date" type="date" value={updatedFrom} onChange={(e) => setUpdatedFrom(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
              </FilterToolbar>
              <div className="p-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map(a => (
                  <AssignmentCard key={a.id} item={a} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
