"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useImportEnrollments } from "@/hooks/enrollments/useImportEnrollments";

export default function ImportDialog({
  title,
  onSubmit,
  onCancel,
}: {
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { importEnrollments, loading } = useImportEnrollments();
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    const res = await importEnrollments({ file });
    if (res?.success) {
      onSubmit();
    }
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <p className="text-sm text-slate-600">
          Upload an Excel (.xlsx or .xls) file containing multiple enrollments for one or more courses.
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-slate-300 rounded-md p-2 text-sm"
        />

        {file && (
          <div className="text-xs text-slate-500">
            Selected: <span className="font-medium">{file.name}</span>
          </div>
        )}
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading || !file}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? "Importing..." : "Import"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
