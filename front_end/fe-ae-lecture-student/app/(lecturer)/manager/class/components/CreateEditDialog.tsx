"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { ClassItem, FormState } from "../../../../../types/class.types";

export default function CreateEditDialog({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: FormState;
  onSubmit: (data: Required<FormState>) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [semester, setSemester] = useState(initial?.semester ?? "");
  const [status, setStatus] = useState<ClassItem["status"]>(initial?.status ?? "active");

  useEffect(() => {
    // reset when initial changes (open edit for different row)
    if (initial) {
      setCode(initial.code);
      setName(initial.name);
      setSemester(initial.semester);
      setStatus(initial.status ?? "active");
    } else {
      setCode("");
      setName("");
      setSemester("");
      setStatus("active");
    }
  }, [initial]);

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle className="text-slate-900">{title}</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ code: code.trim(), name: name.trim(), semester: semester.trim(), status });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Mã lớp" placeholder="VD: MKT101" required value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Kỳ học" placeholder="VD: Fall 2025" required value={semester} onChange={(e) => setSemester(e.target.value)} />
        </div>
        <Input label="Tên lớp" placeholder="Nhập tên lớp" required value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStatus("active")}
            className={`btn ${status === "active" ? "btn-primary" : "btn-ghost"} h-8`}
          >
            Kích hoạt
          </button>
          <button
            type="button"
            onClick={() => setStatus("archived")}
            className={`btn ${status === "archived" ? "btn-primary" : "btn-ghost"} h-8`}
          >
            Lưu trữ
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </DialogContent>
  );
}
