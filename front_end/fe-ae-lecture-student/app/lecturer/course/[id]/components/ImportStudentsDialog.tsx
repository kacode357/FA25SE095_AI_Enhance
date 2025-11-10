"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [createAccountChecked, setCreateAccountChecked] = useState(true);
  const [failedImport, setFailedImport] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const { importStudents, loading } = useImportStudentsSpecificCourse();

  const handleImport = async (createAccountIfNotFound = false) => {
    if (!file) return;

    const res = await importStudents({
      file,
      courseId,
      createAccountIfNotFound,
    });

    if (res) {
      setResponseMsg(res.message || null);

      // Nếu có lỗi (students chưa có account)
      if (res.failedEnrollments > 0 && !createAccountIfNotFound) {
        setFailedImport(true);
        return; // Không đóng dialog
      }

      // Nếu import hoàn toàn thành công hoặc đã tạo account thành công
      if (res.success) {
        setFailedImport(false);
        setFile(null);
        setCreateAccountChecked(false);
        onSubmit?.();
        onImported?.();
        onOpenChange(false);
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setCreateAccountChecked(checked);
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

          {responseMsg && (
            <p
              className={`text-sm mt-1 ${failedImport ? "text-yellow-500" : "text-green-600"
                }`}
            >
              {responseMsg}
            </p>
          )}

          {failedImport && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="createAccount"
                checked={createAccountChecked}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="createAccount"
                className="text-sm text-slate-700 cursor-pointer select-none"
              >
                Auto-create accounts for unknown emails
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="text-violet-800 hover:text-violet-500"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          {!failedImport ? (
            <Button className="btn btn-gradient-slow" onClick={() => handleImport()} disabled={!file || loading}>
              {loading ? "Importing..." : "Confirm Import"}
            </Button>
          ) : (
            <Button
              onClick={() => handleImport(true)}
              disabled={!file || !createAccountChecked || loading}
              className="btn btn-gradient-slow"
            >
              {loading ? "Creating..." : "Create Accounts & Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
