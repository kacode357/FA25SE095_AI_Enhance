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
      if (mounted) {
        if (Array.isArray(res)) {
          setUsers(res);
        } else if (res && Array.isArray((res as any).users)) {
          setUsers((res as any).users);
        } else {
          setUsers([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    // Make sure users is an array at runtime
    const all = Array.isArray(users) ? users : [];
    if (!kw) return all;
    return all.filter((u) =>
      [u.fullName, u.email, u.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw))
    );
  }, [users, keyword]);

  return (
    <Card className="h-full w-full min-w-0 flex border-slate-300 flex-col gap-2 p-2">
      <Input
        placeholder="Find users in class..."
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
        <ScrollArea className="flex-1 min-h-0">
          <div className="h-full flex flex-col">
            <ul className="space-y-1 pr-2 flex-1">
              {loading && users.length === 0 ? (
                <li className="text-sm text-muted-foreground p-2">Loading...</li>
              ) : (Array.isArray(filtered) && filtered.length === 0) ? (
                <li className="text-sm text-muted-foreground p-2">No users.</li>
              ) : (
                filtered.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => onSelectUser?.(u)}
                      className="w-full text-left p-2 rounded hover:bg-muted transition"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
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
                        <div className="text-xs text-muted-foreground truncate ml-2">{u.role}</div>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
