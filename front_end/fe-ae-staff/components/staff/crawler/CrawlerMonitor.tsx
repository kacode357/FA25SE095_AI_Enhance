"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface Job { id:string; source:string; status:'RUNNING'|'FAILED'|'IDLE'; startedAt:string; duration:number; }
const jobs:Job[] = Array.from({length:10}).map((_,i)=>({ id:`J${i+1}`, source:`Source-${i+1}`, status: i%5===0? 'FAILED': i%3===0 ? 'IDLE':'RUNNING', startedAt:new Date(Date.now()-i*720000).toISOString(), duration: 1200 + i*37 }));

export function CrawlerMonitor(){
  const [blockedSources, setBlockedSources] = useState<string[]>(['SpamSite','MaliciousFeed']);
  function toggleBlock(src:string){ setBlockedSources(b => b.includes(src)? b.filter(s=>s!==src): [...b, src]); }
  return (
    <div className="space-y-6">
      <StaffSectionHeader title="Crawler Operations" description="Giám sát tiến trình thu thập và nguồn bị chặn." accent="indigo" />
      <div className="grid xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Active Jobs</h3>
              <div className="flex gap-2">
                <button className="h-8 px-3 rounded-md border border-slate-200 text-xs bg-white">Refresh</button>
                <button className="h-8 px-3 rounded-md bg-indigo-600 text-white text-xs">Restart Failed</button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2">Job</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(j=> (
                  <tr key={j.id} className="hover:bg-sky-50">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{j.id}</td>
                    <td className="px-3 py-2">{j.source}</td>
                    <td className="px-3 py-2"><span className={`inline-flex items-center rounded-full h-5 px-2 text-[10px] font-medium ring-1 ${j.status==='FAILED' && 'bg-rose-100 text-rose-700 ring-rose-200'} ${j.status==='RUNNING' && 'bg-emerald-100 text-emerald-700 ring-emerald-200'} ${j.status==='IDLE' && 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{j.status}</span></td>
                    <td className="px-3 py-2 text-xs text-slate-500">{new Date(j.startedAt).toLocaleTimeString()}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{j.duration}s</td>
                    <td className="px-3 py-2 text-right text-xs"><button className="h-7 px-2 rounded-md border border-slate-200 bg-white mr-1">Inspect</button><button className="h-7 px-2 rounded-md bg-indigo-600 text-white">Restart</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Blocked Sources</h3>
            <ul className="flex flex-wrap gap-2 text-xs">
              {blockedSources.map(s=> (
                <li key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-100 text-rose-700">
                  {s}
                  <button onClick={()=>toggleBlock(s)} aria-label="Unblock" className="hover:text-rose-900">×</button>
                </li>
              ))}
            </ul>
            <form className="mt-3 flex gap-2 text-xs" onSubmit={(e)=>{ e.preventDefault(); const f = new FormData(e.currentTarget); const val = (f.get('src') as string).trim(); if(val) { toggleBlock(val); e.currentTarget.reset(); }}}>
              <input name="src" placeholder="Add source" className="flex-1 h-8 rounded-md border border-slate-200 px-2" />
              <button className="h-8 px-3 rounded-md bg-rose-600 text-white">Block</button>
            </form>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">System Health</h3>
            <p>Active Jobs: {jobs.filter(j=>j.status==='RUNNING').length}</p>
            <p>Failed Jobs: {jobs.filter(j=>j.status==='FAILED').length}</p>
            <p>Throughput (mock): 128 req/min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
