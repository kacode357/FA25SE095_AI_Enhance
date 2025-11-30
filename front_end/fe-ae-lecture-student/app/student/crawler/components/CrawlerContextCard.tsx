"use client";

type Props = {
  courseId: string;
  assignmentId: string;
  groupId: string;
  loadingConversations: boolean;
  conversationsCount: number;
};

export default function CrawlerContextCard({
  courseId,
  assignmentId,
  groupId,
  loadingConversations,
  conversationsCount,
}: Props) {
  return (
    <div className="max-w-xl border rounded-lg bg-white shadow-sm p-3 sm:p-4 space-y-2 text-xs">
      <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
        Context
      </h2>
      <div className="space-y-1">
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

      <div className="mt-2 text-[11px] text-slate-500">
        {loadingConversations ? (
          <span>Loading conversations…</span>
        ) : conversationsCount > 0 ? (
          <span>
            Đã tìm thấy <b>{conversationsCount}</b> conversation cho assignment
            này.
          </span>
        ) : (
          <span>Chưa có conversation nào cho assignment này.</span>
        )}
      </div>

      {!assignmentId && (
        <p className="mt-1 text-[11px] text-red-500">
          Cần có <code>assignmentId</code> trong URL để tạo conversation.
        </p>
      )}
    </div>
  );
}
