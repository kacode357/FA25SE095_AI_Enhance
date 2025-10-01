"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface UsageRow { id:string; owner:string; crawler:number; aiReports:number; period:string; }
const data:UsageRow[] = Array.from({length:12}).map((_,i)=>({ id:`R${i+1}`, owner: i%2===0? `Class-${i+1}`:`Dept-${i+1}`, crawler: 300 + i*23, aiReports: 80 + i*11, period:'This Month' }));

export function ReportsDashboard(){
  const [filter, setFilter] = useState('This Month');
  return (
    <div className="space-y-6">
      <StaffSectionHeader title="Statistics & Reports" description="Báo cáo sử dụng theo lớp / khoa." accent="indigo" />
      <div className="flex flex-wrap gap-3 items-center text-xs">
        {['This Week','This Month','Quarter','Year'].map(p=> (
          <button key={p} onClick={()=> setFilter(p)} className={`h-8 px-3 rounded-md border text-xs ${filter===p? 'bg-indigo-600 text-white border-indigo-600':'bg-white border-slate-200'}`}>{p}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Crawler Jobs</th>
                  <th className="px-3 py-2 text-left">AI Reports</th>
                  <th className="px-3 py-2 text-left">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.filter(d=> d.period===filter).map(r=> (
                  <tr key={r.id} className="hover:bg-indigo-50/50">
                    <td className="px-3 py-2 font-medium text-slate-700">{r.owner}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{r.crawler}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{r.aiReports}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{r.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 h-52 flex items-center justify-center text-slate-400 text-sm">Chart Placeholder (Crawler)</div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 h-52 flex items-center justify-center text-slate-400 text-sm">Chart Placeholder (AI Reports)</div>
        </div>
      </div>
    </div>
  );
}
