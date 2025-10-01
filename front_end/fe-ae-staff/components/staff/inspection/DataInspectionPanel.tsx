"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface Sample { id:string; content:string; source:string; flagged:boolean; }
const samples:Sample[] = Array.from({length:14}).map((_,i)=>({ id:`S${i+1}`, content:`Sample content snippet ${i+1} lorem ipsum dolor sit amet consectetur adipiscing elit sed do.`, source:`Source-${(i%5)+1}`, flagged: i%6===0 }));

export function DataInspectionPanel(){
  const [active, setActive] = useState<Sample|null>(null);
  const [labels, setLabels] = useState<Record<string,'CORRECT'|'INCORRECT'|undefined>>({});
  const [violations, setViolations] = useState<string[]>([]);

  function label(id:string, value:'CORRECT'|'INCORRECT'){ setLabels(l => ({ ...l, [id]: value })); }
  function report(id:string){ setViolations(v=> v.includes(id)? v : [...v, id]); }

  return (
    <div className="space-y-6">
      <StaffSectionHeader title="Data Review" description="Gán nhãn và báo cáo nội dung vi phạm." accent="emerald" />
      <div className="grid xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-2">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Samples</h3>
              <div className="flex gap-2 text-xs"><button className="h-8 px-3 rounded-md border border-slate-200 bg-white">Refresh</button><button className="h-8 px-3 rounded-md bg-emerald-600 text-white">Next Batch</button></div>
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {samples.map(s=> (
                <li key={s.id} onClick={()=> setActive(s)} className="px-4 py-3 cursor-pointer hover:bg-emerald-50 flex gap-3">
                  <span className="text-[11px] font-mono text-slate-400 w-10">{s.id}</span>
                  <p className="flex-1 line-clamp-2 text-slate-700 text-[13px]">{s.content}</p>
                  {labels[s.id] && <span className={`text-[10px] h-5 px-2 rounded-full inline-flex items-center font-medium ${labels[s.id]==='CORRECT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{labels[s.id]}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="xl:col-span-5 space-y-4">
          {active ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
              <StaffSectionHeader title={active.id} description={active.source} accent="emerald" />
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 max-h-72 overflow-auto">{active.content.repeat(4)}</div>
              <div className="flex gap-2 text-xs">
                <button onClick={()=>label(active.id,'CORRECT')} className="h-8 px-3 rounded-md bg-emerald-600 text-white">Correct</button>
                <button onClick={()=>label(active.id,'INCORRECT')} className="h-8 px-3 rounded-md bg-rose-600 text-white">Incorrect</button>
                <button onClick={()=>report(active.id)} className="h-8 px-3 rounded-md border border-slate-200 bg-white">Report</button>
              </div>
              {violations.includes(active.id) && <div className="text-[11px] text-rose-600 font-medium">Violation reported.</div>}
            </div>
          ) : <div className="rounded-lg border border-dashed border-slate-300 h-full min-h-60 flex items-center justify-center text-slate-400 text-sm">Select a sample</div>}
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Progress</h3>
            <p>Labeled: {Object.keys(labels).length} / {samples.length}</p>
            <p>Violations: {violations.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
