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
import { useState } from "react";

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
  // Chỉ lấy importStudents và loading từ hook
  const { importStudents, loading } = useImportStudentsSpecificCourse();

  // Loại bỏ useEffect và setErrors

  const handleImport = async () => {
    if (!file) return;
    const res = await importStudents({ file, courseId });
    
    // Nếu API trả về thành công (logic toast/lỗi đã nằm trong hook)
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
        </div>
        
        {/* Loại bỏ phần hiển thị errors ở đây */}

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
