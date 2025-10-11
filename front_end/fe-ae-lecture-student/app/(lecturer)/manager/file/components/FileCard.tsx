"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FileItem } from "@/types/file.types";
import { Eye, HardDriveDownload } from "lucide-react";
import Link from "next/link";

export default function FileCard({ item, onPreview, onDownload }: {
  item: FileItem;
  onPreview?: () => void;
  onDownload?: () => void;
}) {
  return (
    <Card className="p-4 border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 text-[11px] font-medium border border-slate-200 uppercase">{item.type}</span>
            <span className="text-[11px] text-slate-500">{item.sizeKB} KB</span>
          </div>
          <Link href={`/manager/file/${item.id}`} className="mt-1 block text-slate-900 font-semibold truncate hover:text-emerald-700" title={item.name}>
            {item.name}
          </Link>
          <div className="mt-1 text-xs text-slate-600">Owner: {item.owner}</div>
          <div className="mt-1 text-[11px] text-slate-500">Uploaded: {new Date(item.uploadedAt).toLocaleString("vi-VN")}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2 !bg-blue-50 text-emerald-700" onClick={onPreview}><Eye className="size-4" /></Button>
          <Button variant="ghost" className="h-8 px-2 !bg-emerald-50 text-emerald-700" onClick={onDownload}><HardDriveDownload className="size-4" /></Button>
        </div>
      </div>
    </Card>
  );
}
