// app/(staff)/staff/manager/enrollments/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { useEnrollmentImport } from "@/hooks/enrollment/useEnrollmentImport";
import { useEnrollmentTemplate } from "@/hooks/enrollment/useEnrollmentTemplate";

export default function ImportEnrollmentsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local UI state
  const [file, setFile] = useState<File | null>(null);
  const [createAccountIfNotFound, setCreateAccountIfNotFound] = useState<boolean>(true);

  // Hooks cho template và import
  const { loading: loadingTemplate, downloadTemplate } = useEnrollmentTemplate();
  const {
    loading: loadingImport,
    data: result,
    errorMessage,
    importEnrollments,
    reset,
  } = useEnrollmentImport();

  const canImport = !!file && !loadingImport;

  const fileName = useMemo(() => file?.name ?? "No file selected", [file]);

  // Handlers
  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (loadingImport) return;
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    await importEnrollments({ file, createAccountIfNotFound });
  };

  const handleReset = () => {
    setFile(null);
    setCreateAccountIfNotFound(true);
    reset();
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
            Import Enrollments
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Bulk import students via Excel • Lecturers &amp; Staff only
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Download Template */}
        <Card className="border card rounded-2xl lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
              Download Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Use this Excel template to prepare your student list. Keep headers unchanged for best results.
            </p>

            <Button
              onClick={() => downloadTemplate()}
              disabled={loadingTemplate}
              className="rounded-xl inline-flex btn btn-gradient-slow items-center gap-2"
            >
              {loadingTemplate ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {loadingTemplate ? "Preparing..." : "Download Template (.xlsx)"}
            </Button>

            <div
              className="flex items-start gap-2 rounded-xl border p-3 text-xs"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              <Info className="size-4 shrink-0 mt-0.5" />
              <div>
                Template contains sample rows and valid columns. Remove example rows before importing.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Form */}
        <Card className="border card rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
              Upload &amp; Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-2xl border border-dashed p-6 flex flex-col items-center justify-center gap-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <FileSpreadsheet className="size-8 opacity-80" />
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {fileName}
              </div>
              <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                Drag &amp; drop your <b>.xlsx</b> file here, or
              </div>
              <div className="flex items-center gap-2">
                <input
                  title="File"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button variant="outline" className="rounded-xl" onClick={handlePickFile} disabled={loadingImport}>
                  Choose file
                </Button>
                {file && (
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => setFile(null)}
                    disabled={loadingImport}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Options */}
            <label className="flex items-center gap-2 text-sm select-none" style={{ color: "var(--foreground)" }}>
              <input
                type="checkbox"
                checked={createAccountIfNotFound}
                onChange={(e) => setCreateAccountIfNotFound(e.target.checked)}
                className="size-4 rounded border"
                style={{ borderColor: "var(--color-border)" }}
                disabled={loadingImport}
              />
              Auto-create accounts for unknown emails
            </label>

            {/* Import button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleImport}
                disabled={!canImport}
                className="rounded-xl btn btn-gradient-slow inline-flex items-center gap-2"
              >
                {loadingImport ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                {loadingImport ? "Importing..." : "Start Import"}
              </Button>

              {!result && !errorMessage && (
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Only <b>.xlsx</b> files are supported. Large files may take a moment.
                </span>
              )}
            </div>

            {/* Error inline (nếu lỗi tổng quát) */}
            {errorMessage && (
              <div
                className="mt-2 flex items-start gap-2 rounded-xl border p-3 text-sm"
                style={{ borderColor: "var(--color-border)", color: "var(--foreground)" }}
              >
                <XCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Import failed</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {errorMessage}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card className="border card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
              Import Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                <FileText className="mr-1 size-3.5" />
                Total Rows: {result.totalRows}
              </Badge>
              <Badge className="bg-green-100 text-green-700 border border-green-200">
                <CheckCircle2 className="mr-1 size-3.5" />
                Success: {result.successfulEnrollments}
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                New Accounts: {result.studentsCreated}
              </Badge>
              <Badge className="bg-rose-100 text-rose-700 border border-rose-200">
                <XCircle className="mr-1 size-3.5" />
                Failed: {result.failedEnrollments}
              </Badge>
            </div>

            {/* Enrolled course IDs (nếu có) */}
            {result.enrolledCourseIds?.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Affected Courses
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {result.enrolledCourseIds.join(", ")}
                </div>
              </div>
            )}

            {/* Created student emails */}
            {result.createdStudentEmails?.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Accounts Created
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {result.createdStudentEmails.join(", ")}
                </div>
              </div>
            )}

            {/* Error list */}
            {result.errors?.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Errors
                </div>
                <ul
                  className="max-h-52 overflow-auto rounded-xl border p-3 space-y-2 text-xs"
                  style={{ borderColor: "var(--color-border)", color: "var(--foreground)" }}
                >
                  {result.errors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="pt-1">
              <Button variant="outline" className="rounded-xl" onClick={handleReset}>
                Import another file
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
