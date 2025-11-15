// app/student/crawler/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function CrawlerWorkspacePage() {
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") || "";
  const assignmentId = searchParams.get("assignmentId") || "";
  const groupId = searchParams.get("groupId") || "";

  return (
    <div className="min-h-[60vh] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nav">
          Crawler Workspace (Debug)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Trang tạm thời chỉ hiển thị các tham số lấy từ URL.
        </p>
      </div>

      <div className="max-w-lg border rounded-lg bg-white shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          URL parameters
        </h2>

        <div className="text-xs sm:text-sm space-y-1">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">courseId</span>
            <span className="font-mono text-slate-800 break-all">
              {courseId || <span className="text-slate-400">[empty]</span>}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">assignmentId</span>
            <span className="font-mono text-slate-800 break-all">
              {assignmentId || <span className="text-slate-400">[empty]</span>}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">groupId</span>
            <span className="font-mono text-slate-800 break-all">
              {groupId || <span className="text-slate-400">[empty]</span>}
            </span>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          Ví dụ: <code>?courseId=123&assignmentId=456&groupId=789</code>
        </div>
      </div>
    </div>
  );
}
