"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeadlineItem } from "@/types/deadline.types";
import { CalendarClock, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";

type Props = {
  item: DeadlineItem;
  onExtend?: (item: DeadlineItem) => void;
  onRestore?: (item: DeadlineItem) => void;
};

export default function DeadlineCard({ item, onExtend, onRestore }: Props) {
  const orig = new Date(item.original);
  const cur = new Date(item.current);
  const overdue = cur.getTime() < Date.now();

  return (
    <Card className='p-4 border-slate-200 hover:border-emerald-300 transition-colors'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 text-xs font-medium border border-slate-200'>{item.code}</span>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border ${item.status==='ongoing'?'bg-emerald-100 text-emerald-700 border-emerald-200':'bg-slate-200 text-slate-700 border-slate-300'}`}>{item.status}</span>
          </div>
          <Link href={`/manager/deadline/${item.id}`} className='mt-1 block text-slate-900 font-semibold truncate hover:text-emerald-700'>
            {item.assignment}
          </Link>
          <div className='mt-1 text-xs text-slate-600 flex items-center gap-1 flex-wrap'>
            <CalendarClock className='size-3.5 text-emerald-600' />
            <span className='whitespace-nowrap'>{cur.toLocaleDateString('vi-VN')} {cur.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</span>
            {overdue && <span className='text-[10px] px-1 rounded bg-red-100 text-red-600 ml-1'>Overdue</span>}
          </div>
          <div className='mt-2 text-[11px] text-slate-500'>Original: {orig.toLocaleDateString('vi-VN')} {orig.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div>
          <div className='mt-1 text-[11px] text-slate-500'>Extensions: {item.extensions}</div>
        </div>
        <div className='flex gap-2'>
          <Button aria-label='Extend deadline' variant='ghost' className='h-8 px-2 text-emerald-700' onClick={() => onExtend?.(item)}><Clock className='size-4'/>Extend</Button>
          <Button aria-label='Restore original deadline' variant='ghost' className='h-8 px-2 text-emerald-700' onClick={() => onRestore?.(item)}><RefreshCw className='size-4'/>Restore</Button>
        </div>
      </div>
    </Card>
  );
}
