"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGetUsersInCourse } from "@/hooks/chat/useGetUsersInCourse";
import type { CourseChatUserItemResponse } from "@/types/chat/chat.response";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  courseId?: string;
  onSelectUser?: (user: CourseChatUserItemResponse) => void;
};

export default function CourseUsersList({ courseId, onSelectUser }: Props) {
  const { getUsersInCourse, loading } = useGetUsersInCourse();
  const [users, setUsers] = useState<CourseChatUserItemResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!courseId) {
        setUsers([]);
        return;
      }
      const res = await getUsersInCourse(courseId);
      if (mounted && res) setUsers(res);
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return users;
    return users.filter((u) =>
      [u.fullName, u.email, u.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw))
    );
  }, [users, keyword]);

  return (
    <Card className="h-full flex flex-col gap-2 p-2">
      <Input
        placeholder="Tìm người dùng trong lớp..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        disabled={!courseId}
      />
      <Separator />
      {!courseId ? (
        <div className="text-sm text-muted-foreground p-2">
          Select a Course to view a list of users.
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <ul className="space-y-1 pr-2">
            {loading && users.length === 0 ? (
              <li className="text-sm text-muted-foreground p-2">Loading...</li>
            ) : filtered.length === 0 ? (
              <li className="text-sm text-muted-foreground p-2">No users.</li>
            ) : (
              filtered.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => onSelectUser?.(u)}
                    className="w-full text-left p-2 rounded hover:bg-muted transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted">
                        {u.profilePictureUrl ? (
                          <Image
                            src={u.profilePictureUrl}
                            alt={u.fullName}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{u.fullName}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{u.role}</div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
