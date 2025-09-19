"use client";

import { useApp } from "@/components/providers/AppProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import React, { useMemo, useState } from "react";

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const { assignments, submissions, submitAssignment, resubmitAssignment } = useApp();
  const assignment = useMemo(() => assignments.find((a) => a.id === params.id), [assignments, params.id]);
  const existing = useMemo(() => submissions.find((s) => s.assignmentId === params.id), [submissions, params.id]);

  const [url, setUrl] = useState(existing?.contentUrl ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [isGroup, setIsGroup] = useState(existing?.isGroup ?? assignment?.type === "group");
  const [message, setMessage] = useState<string | null>(null);

  if (!assignment) return <div className="p-4">Không tìm thấy bài tập.</div>;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      resubmitAssignment(existing.id, { contentUrl: url, note, isGroup });
      setMessage("Đã gửi lại, chờ chấm.");
    } else {
      submitAssignment({ assignmentId: assignment.id, contentUrl: url, note, isGroup, submittedBy: isGroup ? "g1" : "u1" });
      setMessage("Đã nộp, trạng thái: pending.");
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <p className="text-sm text-black/60">Hạn: {new Date(assignment.dueAt).toLocaleString()} • Loại: {assignment.type}</p>
      </header>

      <section className="card p-4">
        <h2 className="font-semibold mb-2">Mô tả</h2>
        <p className="text-sm text-black/80 whitespace-pre-wrap">{assignment.description}</p>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{existing ? "Sửa & nộp lại" : "Nộp bài"}</h2>
        {assignment.type === "group" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!isGroup} onChange={(e) => setIsGroup(e.target.checked)} />
            Nộp theo nhóm
          </label>
        )}
        <Input label="Link tài liệu/file" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <div>
          <label className="block text-sm text-black/70 mb-1">Ghi chú</label>
          <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho bài nộp" />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onSubmit as any}>{existing ? "Nộp lại" : "Nộp bài"}</Button>
          {existing && <span className="text-sm text-black/60">Trạng thái hiện tại: <span className="badge">{existing.status}</span></span>}
        </div>
        {message && <p className="text-sm text-black/70">{message}</p>}
      </section>

      {existing?.feedback && (
        <section className="card p-4">
          <h2 className="font-semibold mb-2">Feedback từ giảng viên</h2>
          <p className="text-sm text-black/80">{existing.feedback}</p>
        </section>
      )}
    </div>
  );
}
