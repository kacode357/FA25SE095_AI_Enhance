"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface ClassRequest { id:string; lecturer:string; title:string; status:'PENDING'|'APPROVED'|'REJECTED'; requestedAt:string; }
const mock:ClassRequest[] = Array.from({length:6}).map((_,i)=>({ id:`CR${i+1}`, lecturer:`lect${i}@univ.edu`, title:`Class ${i+1}`, status: i%3===0? 'APPROVED': i%3===1? 'PENDING':'REJECTED', requestedAt:new Date(Date.now()-i*5400000).toISOString() }));

export function ClassRequestList(){
  const [selected, setSelected] = useState<ClassRequest|null>(null);
  return (
    <div className="grid md:grid-cols-12 gap-6">
      <div className="md:col-span-7 xl:col-span-8">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-slate-700">Class Requests</h2>
            <div className="flex gap-2">
              <button className="h-8 px-3 rounded-md border border-slate-200 text-xs font-medium bg-white hover:bg-sky-50">Import</button>
              <button className="h-8 px-3 rounded-md bg-sky-600 text-white text-xs font-medium">Export</button>
            </div>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {mock.map(r=> (
              <li key={r.id} className="px-4 py-3 flex items-center gap-3 hover:bg-sky-50 cursor-pointer" onClick={()=> setSelected(r)}>
                <span className="text-[11px] font-mono text-slate-400 w-14">{r.id}</span>
                <span className="flex-1 truncate">{r.title}</span>
                <span className="text-[11px] text-slate-500 w-32 truncate">{r.lecturer}</span>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full bg-slate-100 ${r.status==='PENDING' && 'bg-amber-100 text-amber-700'} ${r.status==='APPROVED' && 'bg-emerald-100 text-emerald-700'} ${r.status==='REJECTED' && 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-5 xl:col-span-4">
        {selected ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
            <StaffSectionHeader title={selected.title} description={selected.id} accent="sky" />
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong>Lecturer:</strong> {selected.lecturer}</p>
              <p><strong>Requested:</strong> {new Date(selected.requestedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {selected.status}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="h-9 rounded-md bg-emerald-600 text-white text-xs font-medium">Create Class</button>
              <button className="h-9 rounded-md bg-indigo-600 text-white text-xs font-medium">Invite Code</button>
              <button className="col-span-2 h-9 rounded-md border border-slate-200 text-xs font-medium bg-white">Reject</button>
            </div>
          </div>
        ) : <div className="rounded-lg border border-dashed border-slate-300 h-full min-h-60 flex items-center justify-center text-slate-400 text-sm">Select request</div>}
      </div>
    </div>
  );
}
