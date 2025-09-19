"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Clock, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";

interface DeadlineItem { id: string; assignment: string; code: string; original: string; current: string; extensions: number; status: 'ongoing' | 'closed'; }

export default function DeadlinePage() {
  const [items] = useState<DeadlineItem[]>([
    { id: 'd1', assignment: 'Market Research Brief', code: 'ASG01', original: new Date(Date.now()+86400000*3).toISOString(), current: new Date(Date.now()+86400000*5).toISOString(), extensions: 1, status: 'ongoing' },
    { id: 'd2', assignment: 'Financial Ratio Analysis', code: 'ASG02', original: new Date(Date.now()+86400000*7).toISOString(), current: new Date(Date.now()+86400000*7).toISOString(), extensions: 0, status: 'ongoing' },
    { id: 'd3', assignment: 'Case Study Retail Pricing', code: 'ASG03', original: new Date(Date.now()-86400000*2).toISOString(), current: new Date(Date.now()-86400000*1).toISOString(), extensions: 2, status: 'closed' },
  ]);

  return (
    <div className='min-h-full flex flex-col p-2 bg-white text-slate-900'>
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Track deadlines and perform assignment extensions.
          </p>
          <Button className='h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1'><Plus className='size-4'/>Create extension batch</Button>
        </div>
      </header>
      <Card className='bg-white border border-slate-200 flex-1 flex flex-col'>
        <CardHeader className='flex flex-col gap-3 -mb-5 border-b border-slate-200'>
          <CardTitle className='text-base text-slate-800'>
            Deadlines & Extensions <span className='text-slate-500'>({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 flex-1 overflow-hidden'>
          {items.length === 0 ? (
            <div className='p-6'>
              <EmptyState title='No data' description='No assignments have been created yet.' />
            </div>
          ) : (
            <div className='h-full overflow-auto border-slate-200'>
              <table className='w-full text-sm'>
                <thead className='sticky top-0 z-10 bg-slate-50 text-slate-600'>
                  <tr>
                    <th className='text-left font-medium px-4 py-2 w-[30%]'>Assignment</th>
                    <th className='text-left font-medium px-4 py-2'>Code</th>
                    <th className='text-left font-medium px-4 py-2'>Original Due</th>
                    <th className='text-left font-medium px-4 py-2'>Current Due</th>
                    <th className='text-left font-medium px-4 py-2'>Extensions</th>
                    <th className='text-left font-medium px-4 py-2'>Status</th>
                    <th className='text-center font-medium px-4 py-2'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => {
                    const orig = new Date(i.original);
                    const cur = new Date(i.current);
                    const overdue = cur.getTime() < Date.now();
                    return (
                      <tr key={i.id} className='border-t border-slate-100 hover:bg-emerald-50/40'>
                        <td className='px-4 py-2 font-medium text-slate-800'>{i.assignment}</td>
                        <td className='px-4 py-2 text-slate-600 font-mono text-xs'>{i.code}</td>
                        <td className='px-4 py-2 text-slate-600 whitespace-nowrap'>{orig.toLocaleDateString('vi-VN')} {orig.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</td>
                        <td className='px-4 py-2 text-slate-600 whitespace-nowrap flex items-center gap-1'>
                          <CalendarClock className='size-4 text-emerald-600' />
                          {cur.toLocaleDateString('vi-VN')} {cur.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}
                          {overdue && <span className='text-[10px] px-1 rounded bg-red-100 text-red-600'>Overdue</span>}
                        </td>
                        <td className='px-4 py-2 text-slate-600 text-xs'>{i.extensions}</td>
                        <td className='px-4 py-2'>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${i.status==='ongoing'?'bg-emerald-100 text-emerald-700':'bg-slate-200 text-slate-700'}`}>{i.status}</span>
                        </td>
                        <td className='px-4 py-2 text-center'>
                          <div className='inline-flex gap-2'>
                            <Button variant='ghost' className='h-8 px-2 text-emerald-700'><Clock className='size-4'/>Extend</Button>
                            <Button variant='ghost' className='h-8 px-2 text-emerald-700'><RefreshCw className='size-4'/>Restore Original</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
