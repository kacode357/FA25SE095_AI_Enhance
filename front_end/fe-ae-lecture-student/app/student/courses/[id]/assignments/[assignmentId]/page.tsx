// app/student/courses/[id]/assignments/[assignmentId]/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  ListTodo,
  Loader2,
  Mail,
  Paperclip,
  Percent,
  Radar,
  Send,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";
import {
  AssignmentStatus,
  type GroupItem,
} from "@/types/assignments/assignment.response";

import TinyMCEEditor from "@/components/common/TinyMCE";

// shadcn
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// css status
import "@/styles/assignment-status.css";

// utils
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
// Đã xóa import parseCourseName

/** Map status -> class trong assignment-status.css */
function getAssignmentStatusClass(status?: AssignmentStatus | null) {
  switch (status) {
    case AssignmentStatus.Draft:
      return "badge-assignment--draft";
    case AssignmentStatus.Scheduled:
      return "badge-assignment--scheduled";
    case AssignmentStatus.Active:
      return "badge-assignment--active";
    case AssignmentStatus.Extended:
      return "badge-assignment--extended";
    case AssignmentStatus.Overdue:
      return "badge-assignment--overdue";
    case AssignmentStatus.Closed:
      return "badge-assignment--closed";
    case AssignmentStatus.Graded:
      return "badge-assignment--graded";
    default:
      return "badge-assignment--draft";
  }
}

/** Format dung lượng file đẹp hơn */
function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

/* ============ group members ============ */
function GroupMembersPanel({ groupId }: { groupId: string }) {
  const { members, loading, error, fetchAllMembers } = useAllMembers();
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!groupId || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchAllMembers(groupId);
  }, [groupId, fetchAllMembers]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading members…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-2">
        Error: {error}
      </div>
    );
  }

  if (!members?.length) {
    return (
      <div className="text-sm text-slate-500 py-2">
        No members.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-200">
      {members.map((m) => (
        <li key={m.id} className="py-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold shadow"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand), var(--nav-active))",
              }}
              title={m.studentName || ""}
            >
              {m.studentName
                ?.split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2) || "ST"}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">
                  {m.studentName}
                </span>

                {m.isLeader && (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border-amber-200 text-amber-700 bg-amber-50/50"
                  >
                    <Shield className="w-3 h-3" />
                    Leader
                  </Badge>
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {m.studentEmail}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ============ page ============ */
export default function AssignmentDetailPage() {
  const { id, assignmentId } =
    useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();

  const courseId = id;
  const aId = assignmentId;

  const { data, loading, fetchAssignment } = useAssignmentById();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!aId || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchAssignment(aId);
  }, [aId, fetchAssignment]);

  const a = data?.assignment;

  const groups: GroupItem[] = Array.isArray(a?.assignedGroups)
    ? a!.assignedGroups!
    : [];

  useEffect(() => {
    if (!a?.isGroupAssignment) {
      setSelectedGroupId(null);
      return;
    }
    const firstId = groups[0]?.id ?? null;
    setSelectedGroupId(firstId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.isGroupAssignment, a?.assignedGroups]);

  if (!aId) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">
          Không tìm thấy <b>assignmentId</b> trong URL.
        </p>
        <Button
          className="mt-4 bg-white border border-brand text-nav hover:text-nav-active"
          variant="outline"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Button>
      </div>
    );
  }

  if (loading || !a) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-nav">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        <span className="text-sm">
          {loading ? "Loading assignment…" : "No data"}
        </span>
      </div>
    );
  }

  const due = a.extendedDueDate ?? a.dueDate;
  const statusClass = getAssignmentStatusClass(a.status);

  // Đã xóa logic parseCourseName

  type Chip = { icon: ReactNode; label: string; className?: string };
  const chips: Chip[] = [];

  if (a.topicName) {
    chips.push({
      icon: <Tag className="w-3 h-3" />,
      label: `Topic name: ${a.topicName}`,
    });
  }

  if (a.isGroupAssignment) {
    chips.push({
      icon: <Users className="w-3 h-3" />,
      label: "Group assignment",
      className: "badge-assignment--group",
    });
  }

  const overdue = a.status === AssignmentStatus.Overdue;
  const draft = a.status === AssignmentStatus.Draft;
  const hasDescription =
    !!a.description && a.description.trim().length > 0;
  const attachments = a.attachments ?? [];
  const hasFormatOrAttachments = !!a.format || attachments.length > 0;
  const hasGroups = groups.length > 0;

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-4">
        {/* Row 1: title + back */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
              <ListTodo className="w-7 h-7 text-nav-active shrink-0" />
              <span className="truncate">{a.title}</span>
            </h1>

            {/* Status + topic + group */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`badge-assignment ${statusClass} inline-flex items-center`}
              >
                {a.status === AssignmentStatus.Active && (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {a.statusDisplay}
              </span>

              {chips.map((c, i) => (
                <span
                  key={i}
                  className={`badge-assignment inline-flex items-center ${c.className || ""
                    }`}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={() => router.push(`/student/courses/${courseId}/assignments`)}
            variant="outline"
            className="bg-white border border-brand text-nav hover:text-nav-active rounded-2xl px-4 h-10"
            title="Go back to Course"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Action bar */}
        <div className="flex-1 lg:flex-none">
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 rounded-2xl bg-white/80 border border-[var(--border)] shadow-sm px-3 py-2">
            <Button
              onClick={() =>
                router.push(
                  `/student/courses/${courseId}/reports?assignmentId=${aId}${selectedGroupId ? `&groupId=${selectedGroupId}` : ""
                  }`,
                )
              }
              className="btn-gradient-slow h-10 px-4 text-sm rounded-xl"
            >
              <Info className="w-4 h-4" />
              <span>View My Reports</span>
            </Button>

            <Button
              onClick={() =>
                router.push(
                  // Sửa dòng này: đưa courseId vào path, giữ lại assignmentId và groupId ở query
                  `/student/courses/${courseId}/crawler?assignmentId=${aId}&groupId=${selectedGroupId}`
                )
              }
              className="btn-yellow-slow h-10 px-4 text-sm rounded-xl"
              title="Open AI Crawler workspace"
            >
              <Radar className="w-4 h-4" />
              <span>Crawl with AI</span>
            </Button>

            <Button
              onClick={() =>
                router.push(
                  `/student/courses/${courseId}/reports/submit?assignmentId=${aId}`,
                )
              }
              className="btn-green-slow h-10 px-4 text-sm rounded-xl"
            >
              <Send className="w-4 h-4" />
              <span>Submit Report</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overdue && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm text-red-700">
            This assignment is <b>Overdue</b>. Please contact your lecturer if
            you need assistance.
          </AlertDescription>
        </Alert>
      )}

      {draft && (
        <Alert className="border-slate-200 bg-slate-50 text-slate-700">
          <Info className="w-4 h-4" />
          <AlertDescription className="text-sm">
            This assignment is currently in <b>Draft</b> and may not be visible
            to students.
          </AlertDescription>
        </Alert>
      )}

      {/* ===== Top Grid: course detail + groups ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        {/* LEFT: info card (full width nếu không có group) */}
        <div
          className={`lg:self-stretch ${hasGroups ? "lg:col-span-7" : "lg:col-span-10"
            }`}
        >
          <Card className="card rounded-2xl h-full flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col gap-4 text-sm text-foreground/80">
              {/* Course info – BOLD line - ĐÃ SỬA */}
              <div className="flex items-start gap-3 min-w-0">
                <BookOpen className="w-5 h-5 text-nav-active mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-nav">
                    Course: {a.courseName || "—"}
                  </div>
                </div>
              </div>

              {/* dates / points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-nav-active" />
                  <span className="font-semibold">Start:</span>
                  <span>{formatDateTimeVN(a.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-nav-active" />
                  <span className="font-semibold">Due:</span>
                  <span>{formatDateTimeVN(due)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-nav-active" />
                  <span className="font-semibold">Points:</span>
                  <span>
                    {typeof a.maxPoints === "number"
                      ? a.maxPoints
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-nav-active" />
                  <span className="font-semibold">Weight:</span>
                  <span>
                    {typeof a.weightPercentage === "number"
                      ? `${a.weightPercentage}%`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* meta nhỏ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">Overdue:</span>{" "}
                  {a.isOverdue ? "Yes" : "No"}
                </div>

                {!a.isOverdue && a.daysUntilDue >= 0 && (
                  <div>
                    <span className="font-semibold">Days until due:</span>{" "}
                    {a.daysUntilDue}
                  </div>
                )}

                {typeof a.assignedGroupsCount === "number" && (
                  <div>
                    <span className="font-semibold">
                      Assigned groups:
                    </span>{" "}
                    {a.assignedGroupsCount}
                  </div>
                )}
              </div>

              {/* FORMAT + ATTACHMENTS (thay cho GRADING CRITERIA) */}
              {hasFormatOrAttachments && (
                <div className="border-t pt-3 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-slate-200">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      FORMAT SUBMIT
                    </div>
                    <div className="text-sm">
                      {a.format || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      ATTACHMENTS
                    </div>

                    {attachments.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No attachments.
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {attachments.map((file) => (
                          <li
                            key={file.id}
                            className="text-sm flex items-start gap-2"
                          >
                            <Paperclip className="w-4 h-4 mt-[2px] text-nav-active flex-shrink-0" />
                            <div className="min-w-0">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-nav hover:text-nav-active hover:underline break-all"
                              >
                                {file.fileName}
                              </a>
                              <div className="text-xs text-slate-500">
                                {formatFileSize(file.fileSize)}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-3 mt-0 border-t border-slate-200 text-xs text-slate-500 justify-end">
              <div className="w-full text-right">
                Created: {formatDateTimeVN(a.createdAt)}
                {a.updatedAt && (
                  <> • Updated: {formatDateTimeVN(a.updatedAt)}</>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT: groups */}
        {hasGroups && (
          <div className="lg:col-span-3 lg:self-start">
            <Card className="card rounded-2xl h-full flex flex-col lg:max-h[300px]">
              <CardContent className="px-4 py-3 flex-1 min-h-0">
                <div className="text-base font-semibold text-nav mb-2">
                  {groups.length === 1
                    ? groups[0].name
                    : "Groups & Members"}
                </div>

                {/* Nếu chỉ 1 group -> chỉ hiện members, không lặp tên group */}
                {groups.length === 1 ? (
                  <ScrollArea className="max-h-[240px]">
                    <GroupMembersPanel groupId={groups[0].id} />
                  </ScrollArea>
                ) : (
                  <ScrollArea className="max-h-[240px]">
                    <div className="space-y-3">
                      {groups.map((g) => (
                        <div key={g.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-nav truncate">
                              {g.name}
                            </span>

                            {g.isLocked && (
                              <span className="badge-assignment badge-assignment--overdue text-[11px]">
                                Locked
                              </span>
                            )}
                          </div>

                          <GroupMembersPanel groupId={g.id} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ===== Description ===== */}
      <Card className="card rounded-2xl">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
          <h2 className="text-lg font-bold text-nav">Description</h2>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {hasDescription ? (
            <TinyMCEEditor
              value={a.description ?? ""}
              onChange={() => { }}
              readOnly
              debounceMs={0}
              placeholder="No description provided."
              className="assignment-description-editor"
            />
          ) : (
            <p className="text-sm text-slate-500">
              No description provided.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
