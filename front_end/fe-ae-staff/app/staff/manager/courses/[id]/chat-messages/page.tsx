// app/staff/manager/courses/[id]/chat-messages/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, MessageSquare, User } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho tin nhắn (Bạn hãy chỉnh lại cho đúng)
type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "lecturer" | "student" | "admin";
  content: string;
  createdAt: string;
  avatarUrl?: string | null;
};

// --- GIẢ LẬP VIỆC TẢI DỮ LIỆU ---
// Bạn hãy thay thế phần này bằng hook lấy dữ liệu thật
// ---------------------------------
const usePlaceholderChatMessages = (courseId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!courseId) return;

    const timer = setTimeout(() => {
      setData([
        {
          id: "1",
          senderId: "u-1",
          senderName: "Dương Viết Hoàng",
          senderRole: "student",
          content: "Thầy ơi, deadline của assignment 1 là khi nào vậy ạ?",
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          avatarUrl: null,
        },
        {
          id: "2",
          senderId: "u-2",
          senderName: "Lecturer (You)",
          senderRole: "lecturer",
          content: "Deadline là 23:59 thứ 6 tuần này nhé.",
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          avatarUrl: null,
        },
        {
          id: "3",
          senderId: "u-3",
          senderName: "Phan Kang Min",
          senderRole: "student",
          content: "Em cảm ơn thầy.",
          createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          avatarUrl: null,
        },
      ]);
      setLoading(false);
    }, 1200); // Giả lập 1.2s loading

    return () => clearTimeout(timer);
  }, [courseId]);

  return { data, loading };
};
// ---------------------------------
// --- KẾT THÚC PHẦN GIẢ LẬP ---
// ---------------------------------


export default function ChatMessagesPage() {
  const { id } = useParams();
  const courseId = String(id);

  // Thay thế `usePlaceholderChatMessages` bằng hook thật của bạn
  const { data: messages, loading } = usePlaceholderChatMessages(courseId);
  
  // (Optional) Lấy thông tin khóa học để hiển thị tên (nếu cần)
  // const { data: courseData } = useCourseInfo(courseId); 

  const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleString("en-GB") : "-");

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-500 gap-2">
        <Loader2 className="size-4 animate-spin" />
        Đang tải tin nhắn...
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <MessageSquare className="size-5" />
            Chat Messages
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Lịch sử trao đổi trong khóa học
            {/* {courseData?.courseCode} - {courseData?.courseCodeTitle} */}
          </p>
        </div>
        <Button  className="rounded-xl">
          <Link href={`/staff/manager/courses/${courseId}`}>
            <ArrowLeft className="mr-1 size-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Chat List */}
      <Card className="border card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Message History ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-sm text-center py-10" style={{ color: "var(--color-muted)" }}>
              Chưa có tin nhắn nào trong khóa học này.
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-4">
                  <Avatar className="size-9 border">
                    <AvatarImage src={msg.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {msg.senderName}
                      </span>
                      {msg.senderRole === "lecturer" && (
                        <Badge variant="secondary" className="text-xs">Lecturer</Badge>
                      )}
                      {msg.senderRole === "admin" && (
                        <Badge variant="destructive" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "var(--foreground)", whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </p>
                    <time className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {fmtDate(msg.createdAt)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}