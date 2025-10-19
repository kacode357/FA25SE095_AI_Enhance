"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatVNDateTime } from "@/lib/utils";
import type { ClassItem } from "@/types/class.types";
import { Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

export default function ClassCard({ item, onEdit, onDelete }: {
  item: ClassItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4 border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 text-xs font-medium border border-emerald-200">
              {item.code}
            </span>
            <Badge className={
              "px-2 py-0.5 text-[11px] border " +
              (item.status === "active"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200")
            }>
              {item.status}
            </Badge>
          </div>
          <Link href={`/manager/class/${item.id}`} className="mt-1 block text-slate-900 font-semibold truncate hover:text-emerald-700">
            {item.name}
          </Link>
          <div className="mt-1 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1"><Users className="size-3.5 text-emerald-600" /> {item.students} students</span>
            <span>•</span>
            <span>{item.semester}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2 !bg-emerald-50 text-emerald-700" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" className="h-8 px-2 !bg-red-50 text-red-600" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 sm:grid-cols-4">
        <div>
          <div className="uppercase tracking-wide text-slate-400">Created</div>
          <div className="whitespace-nowrap">{formatVNDateTime(item.createdAt)}</div>
        </div>
        <div>
          <div className="uppercase tracking-wide text-slate-400">Updated</div>
          <div className="whitespace-nowrap">{formatVNDateTime(item.updatedAt)}</div>
        </div>
      </div>
    </Card>
  );
}
