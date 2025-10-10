"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarClock, Clock, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export interface AssignmentCardItem {
  id: string;
  title: string;
  code: string;
  due: string;
  status: "open" | "closed" | "draft";
  submissions: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentCard({ item, onEdit, onDelete, onExtend }: {
  item: AssignmentCardItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onExtend?: () => void;
}) {
  const due = new Date(item.due);
  const overdue = due.getTime() < Date.now();
  const progress = Math.round((item.submissions / Math.max(1, item.total)) * 100);

  return (
    <Card className="p-4 border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 text-xs font-medium border border-slate-200">
              {item.code}
            </span>
            <Badge className={
              "px-2 py-0.5 text-[11px] border " +
              (item.status === "open"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : item.status === "draft"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-slate-200 text-slate-700 border-slate-300")
            }>
              {item.status}
            </Badge>
          </div>
          <Link href={`/manager/assignment/${item.id}`} className="mt-1 block text-slate-900 font-semibold truncate hover:text-emerald-700">
            {item.title}
          </Link>
          <div className="mt-1 text-xs text-slate-600 flex items-center gap-1 flex-wrap">
            <CalendarClock className="size-3.5 text-emerald-600" />
            <span className="whitespace-nowrap">
              {due.toLocaleDateString("vi-VN")} {due.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            {overdue && <span className='text-[10px] px-1 rounded bg-red-100 text-red-600 ml-1'>Overdue</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2 !bg-emerald-50 text-emerald-700" onClick={onExtend}><Clock className="size-4" /></Button>
          <Button variant="ghost" className="h-8 px-2 !bg-blue-50 text-emerald-700" onClick={onEdit}><Pencil className="size-4" /></Button>
          <Button variant="ghost" className="h-8 px-2 !bg-red-50 text-red-600" onClick={onDelete}><Trash2 className="size-4" /></Button>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>Progress</span>
          <span>{item.submissions}/{item.total} ({progress}%)</span>
        </div>
        <progress value={item.submissions} max={Math.max(1, item.total)} className="mt-1 h-1.5 w-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500 rounded"></progress>
      </div>
    </Card>
  );
}
