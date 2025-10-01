"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface Ticket { id:string; subject:string; status:'OPEN'|'PENDING'|'RESOLVED'|'LOCK'; requester:string; updatedAt:string; }

const mockTickets: Ticket[] = Array.from({length:8}).map((_,i)=>({
  id: `${i+1}`,
  subject: i%3===0? 'Yêu cầu mở khóa tài khoản' : i%3===1? 'Đổi email đăng nhập' : 'Không truy cập được lớp học',
  status: (['OPEN','PENDING','RESOLVED','LOCK'] as Ticket['status'][])[i%4],
  requester: `user${i+3}@example.com`,
  updatedAt: new Date(Date.now()- i*3600*1000).toISOString()
}));

const statusColor: Record<Ticket['status'], string> = {
  OPEN: 'bg-sky-100 text-sky-700 ring-sky-200',
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
  RESOLVED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  LOCK: 'bg-rose-100 text-rose-700 ring-rose-200'
};

export function TicketList(){
  const [selected, setSelected] = useState<Ticket | null>(null);
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-slate-700">Tickets</h2>
            <div className="flex items-center gap-2">
              <input placeholder="Search..." className="h-8 px-2 rounded-md border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-sky-400" />
              <button className="text-xs px-3 h-8 rounded-md bg-sky-600 text-white font-medium">New</button>
            </div>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {mockTickets.map(t=> (
              <li key={t.id} onClick={()=> setSelected(t)} className="cursor-pointer flex items-start gap-3 px-4 py-3 hover:bg-sky-50/60">
                <span className={`mt-1 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium ring-1 ${statusColor[t.status]}`}>{t.status}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{t.subject}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex gap-3"><span>{t.requester}</span><span>{new Date(t.updatedAt).toLocaleString()}</span></p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" className="mt-1 text-slate-400"><path fill="currentColor" d="M10 17l5-5-5-5v10z"/></svg>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        {selected ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
            <StaffSectionHeader title={selected.subject} description={`Ticket #${selected.id}`} accent="indigo" />
            <div className="text-xs text-slate-500 space-y-1">
              <p><strong className="text-slate-600">Requester:</strong> {selected.requester}</p>
              <p><strong className="text-slate-600">Updated:</strong> {new Date(selected.updatedAt).toLocaleString()}</p>
              <p><strong className="text-slate-600">Status:</strong> <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium ring-1 ${statusColor[selected.status]}`}>{selected.status}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="h-9 rounded-md bg-indigo-600 text-white text-xs font-medium">Reply</button>
              <button className="h-9 rounded-md bg-emerald-600 text-white text-xs font-medium">Resolve</button>
              <button className="h-9 rounded-md bg-rose-600 text-white text-xs font-medium col-span-2">Unlock Account</button>
              <button className="h-9 rounded-md border border-slate-200 bg-white text-xs font-medium col-span-2">Change Email</button>
            </div>
            <textarea className="w-full h-32 text-sm rounded-md border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Internal notes..."></textarea>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 text-slate-400 text-sm h-full min-h-60 flex items-center justify-center">Select a ticket to view details</div>
        )}
      </div>
    </div>
  );
}
