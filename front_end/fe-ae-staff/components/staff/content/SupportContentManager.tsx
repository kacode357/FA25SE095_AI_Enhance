"use client";
import { useState } from 'react';
import { StaffSectionHeader } from '../layout/StaffSectionHeader';

interface FAQ { id:string; q:string; a:string; }
const initialFaq:FAQ[] = [
  { id:'F1', q:'Làm sao đổi mật khẩu?', a:'Vào trang cá nhân và chọn Đổi mật khẩu.'},
  { id:'F2', q:'Không vào được lớp?', a:'Kiểm tra mã mời còn hiệu lực hoặc liên hệ staff.'}
];

export function SupportContentManager(){
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaq);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [script, setScript] = useState<string>('Hello! Tôi có thể giúp gì cho bạn hôm nay?');

  function save(form: FormData){
    const id = editing?.id || `F${faqs.length+1}`;
    const next:FAQ = { id, q: (form.get('q') as string)||'', a:(form.get('a') as string)||'' };
    setFaqs(f=> editing? f.map(x=> x.id===id? next:x) : [...f,next]);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <StaffSectionHeader title="Support Content" description="FAQ, hướng dẫn & kịch bản chatbot." accent="indigo" />
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">FAQ</h3>
              <button onClick={()=> setEditing({ id:'', q:'', a:'' })} className="h-8 px-3 rounded-md bg-sky-600 text-white text-xs">New</button>
            </div>
            <ul className="space-y-2 text-sm">
              {faqs.map(f=> (
                <li key={f.id} className="p-3 rounded-md border border-slate-200 hover:bg-sky-50 cursor-pointer" onClick={()=> setEditing(f)}>
                  <p className="font-medium text-slate-800">{f.q}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.a}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Chatbot Script</h3>
            <textarea value={script} onChange={e=> setScript(e.target.value)} className="w-full h-40 text-sm rounded-md border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="flex justify-end"><button className="h-8 px-4 rounded-md bg-indigo-600 text-white text-xs">Save</button></div>
          </div>
        </div>
        <div className="lg:col-span-7">
          {editing ? (
            <form action={(formData)=> save(formData)} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">{editing.id? 'Edit FAQ':'New FAQ'}</h3>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-600">Question</span>
                <input name="q" defaultValue={editing.q} className="h-9 rounded-md border border-slate-200 px-2" required />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-600">Answer</span>
                <textarea name="a" defaultValue={editing.a} className="h-40 rounded-md border border-slate-200 p-2 text-sm" required />
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=> setEditing(null)} className="h-9 px-4 rounded-md border border-slate-200 bg-white text-xs">Cancel</button>
                <button className="h-9 px-4 rounded-md bg-emerald-600 text-white text-xs">Save FAQ</button>
              </div>
            </form>
          ) : <div className="rounded-lg border border-dashed border-slate-300 h-full min-h-60 flex items-center justify-center text-slate-400 text-sm">Select or create FAQ</div>}
        </div>
      </div>
    </div>
  );
}
