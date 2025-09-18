"use client";
import { Button } from "@/components/ui/button";
import { CalendarClock, Clock, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";

interface AssignmentItem { id: string; title: string; code: string; due: string; status: "open" | "closed" | "draft"; submissions: number; total: number; }

export default function AssignmentPage() {
  const [items] = useState<AssignmentItem[]>([
    { id: '1', title: 'Market Research Brief', code: 'ASG01', due: new Date(Date.now()+86400000*3).toISOString(), status: 'open', submissions: 12, total: 40 },
    { id: '2', title: 'Financial Ratio Analysis', code: 'ASG02', due: new Date(Date.now()+86400000*7).toISOString(), status: 'draft', submissions: 0, total: 40 },
    { id: '3', title: 'Case Study: Retail Pricing', code: 'ASG03', due: new Date(Date.now()-86400000*1).toISOString(), status: 'closed', submissions: 37, total: 40 },
  ]);

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

      {items.length === 0 ? (
        <EmptyState title="No assignments yet" description="Click the create button to add a new assignment." icon={<FileText className='size-10'/>} />
      ) : (
        <div className="overflow-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-4 py-2 w-[30%]">Title</th>
                <th className="text-left font-medium px-4 py-2">Code</th>
                <th className="text-left font-medium px-4 py-2">Due</th>
                <th className="text-left font-medium px-4 py-2">Status</th>
                <th className="text-left font-medium px-4 py-2">Progress</th>
                <th className="text-center font-medium px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => {
                const due = new Date(a.due);
                const overdue = due.getTime() < Date.now();
                return (
                  <tr key={a.id} className="border-t border-slate-100 hover:bg-emerald-50/40">
                    <td className="px-4 py-2 font-medium text-slate-800">{a.title}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono text-xs">{a.code}</td>
                    <td className="px-4 py-2 text-slate-600 flex items-center gap-1">
                      <CalendarClock className="size-4 text-emerald-600" />
                      <span className="whitespace-nowrap">{due.toLocaleDateString('vi-VN')} {due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      {overdue && <span className='text-[10px] px-1 rounded bg-red-100 text-red-600'>Overdue</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${a.status==='open' ? 'bg-emerald-100 text-emerald-700' : a.status==='closed' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 text-xs">{a.submissions}/{a.total} ({Math.round(a.submissions/a.total*100)}%)</td>
                    <td className="px-4 py-2 text-center">
                      <div className="inline-flex gap-2">
                        <Button variant='ghost' className='h-8 px-2 text-emerald-700'><Pencil className='size-4'/>Edit</Button>
                        <Button variant='ghost' className='h-8 px-2 text-emerald-700'><Clock className='size-4'/>Extend</Button>
                        <Button variant='ghost' className='h-8 px-2 text-red-600'><Trash2 className='size-4'/>Delete</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
