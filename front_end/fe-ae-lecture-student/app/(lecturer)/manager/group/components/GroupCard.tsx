"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GroupItem } from "@/types/group.types";
import { Users } from "lucide-react";
import Link from "next/link";

export default function GroupCard({ item, onAdd, onEdit, onDelete }: {
  item: GroupItem;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const full = item.members >= item.max;
  return (
    <Card className="p-4 border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${item.status==='active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{item.status}</span>
            {full && <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 text-[11px] font-medium border border-amber-200">Full</span>}
          </div>
          <Link href={`/manager/group/${item.id}`} className="mt-1 block text-slate-900 font-semibold truncate hover:text-emerald-700">
            {item.name}
          </Link>
          <div className="mt-1 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1"><Users className="size-3.5 text-emerald-600" /> {item.members}/{item.max}</span>
            <span>•</span>
            <span>Leader: {item.leader}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2 !bg-emerald-50 text-emerald-700" onClick={onAdd}><Users className="size-4" /></Button>
          <Button variant="ghost" className="h-8 px-2 !bg-blue-50 text-emerald-700" onClick={onEdit}>Edit</Button>
          <Button variant="ghost" className="h-8 px-2 !bg-red-50 text-red-600" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </Card>
  );
}
