"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeadlineItem } from "@/types/deadline.types";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FilterToolbar from "../components/FilterToolbar";
import DeadlineCard from "./components/DeadlineCard";

export default function DeadlinePage() {
  const [items] = useState<DeadlineItem[]>([
    { id: 'd1', assignment: 'Market Research Brief', code: 'ASG01', original: new Date(Date.now()+86400000*3).toISOString(), current: new Date(Date.now()+86400000*5).toISOString(), extensions: 1, status: 'ongoing' },
    { id: 'd2', assignment: 'Financial Ratio Analysis', code: 'ASG02', original: new Date(Date.now()+86400000*7).toISOString(), current: new Date(Date.now()+86400000*7).toISOString(), extensions: 0, status: 'ongoing' },
    { id: 'd3', assignment: 'Case Study Retail Pricing', code: 'ASG03', original: new Date(Date.now()-86400000*2).toISOString(), current: new Date(Date.now()-86400000*1).toISOString(), extensions: 2, status: 'closed' },
  ]);

  // Filters
  const [qName, setQName] = useState("");
  const [qCode, setQCode] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (qName.trim() && !i.assignment.toLowerCase().includes(qName.trim().toLowerCase())) return false;
      if (qCode.trim() && !i.code.toLowerCase().includes(qCode.trim().toLowerCase())) return false;
      if (status !== 'all' && i.status !== status) return false;
      if (overdueOnly && new Date(i.current).getTime() >= Date.now()) return false;
      return true;
    });
  }, [items, qName, qCode, status, overdueOnly]);

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
            Deadlines & Extensions <span className='text-slate-500'>({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 flex-1 overflow-hidden'>
          {filtered.length === 0 ? (
            <div className='p-6'>
              <EmptyState title='No data' description='No assignments have been created yet.' />
            </div>
          ) : (
            <>
              <FilterToolbar
                rightSlot={
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span>{filtered.length} result{filtered.length !== 1 && 's'}</span>
                    <button type='button' className='h-7 px-2 rounded bg-slate-100 hover:bg-slate-200' onClick={() => { setQName(''); setQCode(''); setStatus('all'); setOverdueOnly(false); }}>Clear</button>
                  </div>
                }
              >
                <input aria-label='Search assignment' placeholder='Search assignment' value={qName} onChange={(e)=>setQName(e.target.value)} className='h-8 w-full sm:w-64 text-xs rounded-md border border-slate-300 px-2' />
                <input aria-label='Filter code' placeholder='Code' value={qCode} onChange={(e)=>setQCode(e.target.value)} className='h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2' />
                <select aria-label='Filter status' value={status} onChange={(e)=>setStatus(e.target.value)} className='h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2 bg-white'>
                  <option value='all'>All</option>
                  <option value='ongoing'>Ongoing</option>
                  <option value='closed'>Closed</option>
                </select>
                <label className='inline-flex items-center gap-2 text-[11px] text-slate-600'>
                  <input type='checkbox' checked={overdueOnly} onChange={(e)=>setOverdueOnly(e.target.checked)} className='size-3.5' />
                  Overdue only
                </label>
              </FilterToolbar>
              <div className='p-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filtered.map(i => (
                  <DeadlineCard key={i.id} item={i} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
