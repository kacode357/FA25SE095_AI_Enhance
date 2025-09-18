"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";

interface GradeItem { id: string; studentId: string; name: string; group?: string; score?: number; status: 'pending' | 'submitted' | 'late'; }

export default function GradingPage() {
  const [items] = useState<GradeItem[]>([
    { id: 's1', studentId: 'SV001', name: 'Nguyen Van A', group: 'Group 1', score: 8.5, status: 'submitted' },
    { id: 's2', studentId: 'SV002', name: 'Tran Thi B', group: 'Group 1', score: 9, status: 'submitted' },
    { id: 's3', studentId: 'SV003', name: 'Le C', group: 'Group 2', status: 'pending' },
    { id: 's4', studentId: 'SV004', name: 'Pham D', group: 'Group 2', score: 6.5, status: 'late' },
  ]);

  return (
    <div className='min-h-full flex flex-col p-2 bg-white text-slate-900'>
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Enter and track student scores in the class.
          </p>
          <div className='flex gap-2'>
            <Button className='h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1'><Save className='size-4'/>Save</Button>
            <Button variant='ghost' className='h-9 px-3 flex items-center gap-1 text-slate-600'><RefreshCw className='size-4'/>Reload</Button>
          </div>
        </div>
      </header>
      {items.length === 0 ? (
        <EmptyState title='No data' description='No students in this class yet.' icon={<FileText className='size-10'/>} />
      ) : (
        <div className='overflow-auto border border-slate-200 rounded-lg'>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 text-slate-600'>
              <tr>
                <th className='text-left font-medium px-4 py-2'>Student ID</th>
                <th className='text-left font-medium px-4 py-2 w-[25%]'>Name</th>
                <th className='text-left font-medium px-4 py-2'>Group</th>
                <th className='text-left font-medium px-4 py-2'>Score</th>
                <th className='text-left font-medium px-4 py-2'>Status</th>
                <th className='text-center font-medium px-4 py-2'>Note</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className='border-t border-slate-100 hover:bg-emerald-50/40'>
                  <td className='px-4 py-2 font-mono text-xs text-slate-600'>{i.studentId}</td>
                  <td className='px-4 py-2 font-medium text-slate-800'>{i.name}</td>
                  <td className='px-4 py-2 text-slate-600 text-xs'>{i.group || '-'}</td>
                  <td className='px-4 py-2'>
                    <Input defaultValue={i.score ?? ''} className='h-8 w-20 text-center text-xs' placeholder='—' />
                  </td>
                  <td className='px-4 py-2'>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${i.status==='submitted' ? 'bg-emerald-100 text-emerald-700' : i.status==='late' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-700'}`}>{i.status}</span>
                  </td>
                  <td className='px-4 py-2 text-center text-[11px] text-slate-400 italic'>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
