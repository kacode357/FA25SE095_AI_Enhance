"use client";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface UploadFile { id: string; name: string; size: number; type: string; }

export default function UploadArea() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onSelect = useCallback((list: FileList | null) => {
    if (!list) return;
    const next: UploadFile[] = Array.from(list).map(f => ({ id: crypto.randomUUID(), name: f.name, size: f.size, type: f.type }));
    setFiles(prev => [...prev, ...next]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onSelect(e.dataTransfer.files);
  }, [onSelect]);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:border-emerald-400 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="size-10 text-emerald-500 mb-3" />
        <p className="text-slate-700 font-medium">Kéo thả tệp vào đây</p>
        <p className="text-slate-400 text-sm">hoặc bấm để chọn</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => onSelect(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map(f => (
            <li key={f.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-slate-700">{f.name}</span>
                <span className="text-[11px] text-slate-400">{(f.size/1024).toFixed(1)} KB</span>
              </div>
              <Button variant="ghost" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}>
                <X className="size-4 text-slate-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
