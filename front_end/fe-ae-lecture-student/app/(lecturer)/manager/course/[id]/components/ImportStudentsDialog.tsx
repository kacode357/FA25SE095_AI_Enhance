"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useImportStudentsSpecificCourse } from "@/hooks/enrollments/useImportStudentsSpecificCourse";
import { useEffect, useState } from "react";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  onSubmit?: () => void;
  onImported?: () => void;
}

export default function ImportStudentsDialog({
  open,
  onOpenChange,
  courseId,
  onSubmit,
  onImported,
}: ImportStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const { importStudents, loading, errors, setErrors } = useImportStudentsSpecificCourse();

  useEffect(() => {
    if (!open) setErrors([]);
  }, [open]);

const handleImport = async () => {
  if (!file) return;
  const res = await importStudents({ file, courseId });
  if (res?.success) {
    onSubmit?.();
    onImported?.();
    setFile(null);
    onOpenChange(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
        <DialogHeader>
          <DialogTitle>Import Students from Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <p className="text-slate-600">
            Upload an Excel (.xlsx or .xls) file to import students into this course.
          </p>

          <input
            placeholder="File"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
          />

          {file && (
            <div className="text-xs text-slate-500">
              Selected file: <span className="font-medium">{file.name}</span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-2 border border-red-300 bg-red-50 text-red-700 text-xs rounded-md p-2 max-h-40 overflow-y-auto">
              <div className="font-medium mb-1">
                Import failed for {errors.length} student{errors.length > 1 ? "s" : ""}:
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Importing..." : "Confirm Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
