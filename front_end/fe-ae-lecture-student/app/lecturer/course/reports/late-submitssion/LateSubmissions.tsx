"use client";

import type { LateSubmissionReport } from "@/types/reports/reports.response";

type Props = {
  items: LateSubmissionReport[];
  loading: boolean;
  error: string | null;
};

export default function LateSubmissions({ items, loading, error }: Props) {
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center p-8 text-slate-600">
          <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Loading late submissions...
        </div>
      ) : error ? (
        <div className="p-6 text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-sm italic text-slate-600">No late submissions found for this course/assignment.</div>
      ) : (
        <div className="overflow-auto max-h-[calc(100vh-220px)]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="text-left font-medium px-4 py-2">#</th>
                <th className="text-left font-medium px-4 py-2">Assignment</th>
                <th className="text-left font-medium px-4 py-2">AssignmentId</th>
                <th className="text-left font-medium px-4 py-2">Group</th>
                <th className="text-left font-medium px-4 py-2">Submitted By</th>
                <th className="text-left font-medium px-4 py-2">Submitted At</th>
                <th className="text-left font-medium px-4 py-2">Deadline</th>
                <th className="text-left font-medium px-4 py-2">Days Late</th>
                <th className="text-left font-medium px-4 py-2">Status</th>
                <th className="text-left font-medium px-4 py-2">Grade</th>
                <th className="text-left font-medium px-4 py-2">Feedback</th>
                <th className="text-left font-medium px-4 py-2">Graded By</th>
                <th className="text-left font-medium px-4 py-2">Graded At</th>
                <th className="text-left font-medium px-4 py-2">Version</th>
                <th className="text-left font-medium px-4 py-2">File</th>
                <th className="text-left font-medium px-4 py-2">Created</th>
                <th className="text-left font-medium px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 align-top">
                  <td className="px-4 py-2">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-900 truncate max-w-[280px]">{r.assignmentTitle || "—"}</div>
                  </td>
                  <td className="px-4 py-2">{r.assignmentId}</td>
                  <td className="px-4 py-2">
                    <div className="text-slate-800">{r.groupName || "—"}</div>
                    {r.groupId && <div className="text-xs text-slate-500">Group: {r.groupId}</div>}
                  </td>
                  <td className="px-4 py-2">{r.submittedBy ?? "—"}</td>
                  <td className="px-4 py-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">{r.deadline ? new Date(r.deadline).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">{r.daysLate ?? "—"}</td>
                  <td className="px-4 py-2">{String(r.status)}</td>
                  <td className="px-4 py-2">{r.grade ?? "—"}</td>
                  <td className="px-4 py-2 max-w-[260px]"><div className="truncate" title={r.feedback || undefined}>{r.feedback ?? "—"}</div></td>
                  <td className="px-4 py-2">{r.gradedBy ?? "—"}</td>
                  <td className="px-4 py-2">{r.gradedAt ? new Date(r.gradedAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">{r.version}</td>
                  <td className="px-4 py-2">{r.fileUrl ? (<a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">Download</a>) : "—"}</td>
                  <td className="px-4 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
