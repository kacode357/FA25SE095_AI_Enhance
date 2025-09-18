"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileSpreadsheet, FileText, FileType2, Loader2 } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";

interface SummaryRow { label: string; value: string | number; }

export default function ExportReportPage(){
  const [format, setFormat] = useState<'csv'|'xlsx'|'pdf'>('xlsx');
  const [isExporting, setIsExporting] = useState(false);

  const summary: SummaryRow[] = [
    { label: 'Total Students', value: 42 },
    { label: 'Groups', value: 8 },
    { label: 'Average Score', value: 7.86 },
    { label: 'Highest Score', value: 9.8 },
    { label: 'Lowest Score', value: 4.5 },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(()=> setIsExporting(false), 1200); // mock
  };

  return (
    <div className='min-h-full flex flex-col p-2 bg-white text-slate-900'>
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Select scope and format to export the final term report.
          </p>
          <Button disabled={isExporting} onClick={handleExport} className='h-9 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white'>
            {isExporting ? <Loader2 className='size-4 animate-spin'/> : <Download className='size-4'/>}
            {isExporting ? 'Exporting...' : 'Export file'}
          </Button>
        </div>
      </header>

      <div className='grid md:grid-cols-3 gap-6'>
        <div className='space-y-6 md:col-span-1'>
          <div className='border border-slate-200 rounded-lg p-4 space-y-4 bg-white'>
            <h4 className='text-sm font-semibold text-slate-700'>Scope</h4>
            <div className='space-y-3 text-xs'>
              <div className='grid gap-1'>
                <label className='font-medium text-slate-600'>Class / Code</label>
                <Input placeholder='e.g. SE1234' className='h-8 text-xs' />
              </div>
              <div className='grid gap-1'>
                <label className='font-medium text-slate-600'>Semester</label>
                <Input placeholder='2025.1' className='h-8 text-xs' />
              </div>
              <div className='grid gap-1'>
                <label className='font-medium text-slate-600'>Academic Year</label>
                <Input placeholder='2025-2026' className='h-8 text-xs' />
              </div>
            </div>
          </div>

          <div className='border border-slate-200 rounded-lg p-4 space-y-4 bg-white'>
            <h4 className='text-sm font-semibold text-slate-700'>Format</h4>
            <div className='space-y-2'>
              {([
                {key:'csv', label:'CSV', icon: FileText, desc:'Raw data, easy to import into other systems'},
                {key:'xlsx', label:'Excel (XLSX)', icon: FileSpreadsheet, desc:'Preserves table structure & formulas'},
                {key:'pdf', label:'PDF', icon: FileType2, desc:'Fixed document for submission or printing'},
              ] as const).map(opt => (
                <button key={opt.key} onClick={()=> setFormat(opt.key)} className={`w-full flex items-start gap-3 rounded-md border p-3 text-left transition ${format===opt.key ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <opt.icon className='size-5 text-emerald-600'/>
                  <div className='flex-1'>
                    <div className='text-xs font-semibold text-slate-700'>{opt.label}</div>
                    <div className='text-[11px] text-slate-500 leading-snug'>{opt.desc}</div>
                  </div>
                  <div className={`size-4 rounded-full border flex items-center justify-center ${format===opt.key ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                    {format===opt.key && <div className='size-2 rounded-full bg-white'/>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='md:col-span-2 space-y-6'>
          <div className='border border-slate-200 rounded-lg bg-white overflow-hidden'>
            <div className='px-4 py-3 border-b bg-slate-50 flex items-center justify-between'>
              <h4 className='text-sm font-semibold text-slate-700'>Overview</h4>
              <span className='text-[11px] font-medium text-slate-500 uppercase tracking-wide'>Preview</span>
            </div>
            <div className='p-4 grid sm:grid-cols-2 gap-3 text-xs'>
              {summary.map(row => (
                <div key={row.label} className='flex items-center justify-between bg-slate-50 rounded-md px-3 py-2'>
                  <span className='text-slate-600'>{row.label}</span>
                  <span className='font-semibold text-slate-800'>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='border border-dashed border-emerald-300 rounded-lg p-6 bg-emerald-50/40 text-center'>
            <p className='text-sm font-medium text-emerald-700 mb-1'>{format.toUpperCase()} file structure sample</p>
            <p className='text-[11px] text-emerald-600'>Shows illustrative columns & key data (static UI).</p>
            <div className='mt-4 text-[10px] font-mono overflow-auto max-h-48 bg-white border border-emerald-200 rounded p-3 text-left'>
              {format === 'csv' && <pre className='leading-relaxed'>student_id,name,group,score,avg,rank
SV001,Nguyen Van A,N1,8.5,7.86,2
SV002,Tran Thi B,N1,9.0,7.86,1
SV004,Pham D,N2,6.5,7.86,12</pre>}
              {format === 'xlsx' && <pre className='leading-relaxed'>Sheets:
- Summary
- Scores
- Groups

[Summary]
Metric | Value
Students | 42
Groups | 8
Average | 7.86</pre>}
              {format === 'pdf' && <pre className='leading-relaxed'>PDF Report
Title: Final Class Report
Semester: 2024.1
Generated: 2024-06-01

Sections:
1. Overview
2. Score Distribution
3. Group Performance
4. Appendix</pre>}
            </div>
          </div>

          <div className='border border-slate-200 rounded-lg bg-white overflow-hidden'>
            <div className='px-4 py-3 border-b bg-slate-50 flex items-center justify-between'>
              <h4 className='text-sm font-semibold text-slate-700'>Notes</h4>
            </div>
            <div className='p-4'>
              <ul className='text-[11px] text-slate-500 list-disc pl-5 space-y-1'>
                <li>This is only static UI, no backend logic yet.</li>
                <li>Actual data will depend on selected class & semester filters.</li>
                <li>PDF file will have page layout with header & summary table.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        title='Improvement Ideas'
        description='Add data field selection, score range filters, and customizable PDF template.'
        icon={<Download className='size-10'/>}
      />
    </div>
  );
}
