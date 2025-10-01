"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface QuotaItem { id:string; owner:string; used:number; limit:number; }
const quotas:QuotaItem[] = Array.from({length:9}).map((_,i)=>({ id:`Q${i+1}`, owner: i%2===0? `Class-${i+1}`:`Dept-${i+1}`, used: 200 + i*57, limit: 1000 + (i%3)*500 }));

export function QuotaDashboard(){
  const [grantTarget, setGrantTarget] = useState<QuotaItem|null>(null);
  const [amount, setAmount] = useState(0);
  return (
    <div className="space-y-6">
      <StaffSectionHeader title="Quota Management" description="Theo dõi & cấp thêm trong giới hạn được ủy quyền." accent="sky" />
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-left">Usage</th>
              <th className="px-3 py-2 text-left">Progress</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotas.map(q=>{
              const pct = Math.min(100, Math.round((q.used / q.limit)*100));
              return (
                <tr key={q.id} className="hover:bg-sky-50">
                  <td className="px-3 py-2 font-medium text-slate-700">{q.owner}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{q.used} / {q.limit}</td>
                  <td className="px-3 py-2">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      {(() => { const steps=[0,10,20,30,40,50,60,70,80,90,100]; const nearest=steps.reduce((a,b)=> Math.abs(b-pct)<Math.abs(a-pct)? b:a,0); return (
                        <div className={`h-full rounded-full transition-all duration-300 ${pct>85? 'bg-rose-500': pct>60? 'bg-amber-500':'bg-emerald-500'} w-[${nearest}%]`} aria-hidden />
                      ); })()}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-xs"><button onClick={()=>{ setGrantTarget(q); setAmount(0); }} className="h-7 px-3 rounded-md border border-slate-200 bg-white">Grant</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {grantTarget && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-end md:items-center justify-center p-4 z-50" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-lg bg-white shadow-lg border border-slate-200 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Grant Additional Quota</h2>
                <p className="text-xs text-slate-500 mt-1">Target: {grantTarget.owner}</p>
              </div>
              <button onClick={()=> setGrantTarget(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <div className="space-y-2 text-xs">
              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Amount</span>
                <input type="number" min={0} value={amount} onChange={e=> setAmount(Number(e.target.value))} className="h-9 rounded-md border border-slate-200 px-2" />
              </label>
              <p className="text-[11px] text-slate-500">Max per grant: 5000 (UI only)</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={()=> setGrantTarget(null)} className="flex-1 h-9 rounded-md border border-slate-200 bg-white text-xs font-medium">Cancel</button>
              <button disabled={amount<=0} className="flex-1 h-9 rounded-md bg-emerald-600 disabled:opacity-40 text-white text-xs font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
