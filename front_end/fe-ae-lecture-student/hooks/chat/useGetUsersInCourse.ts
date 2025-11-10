"use client";

import { useState } from "react";
import { ChatService } from "@/services/chat.services";
import { CourseChatUserItemResponse } from "@/types/chat/chat.response";

export function useGetUsersInCourse() {
  const [loading, setLoading] = useState(false);

  const getUsersInCourse = async (
    courseId: string
  ): Promise<CourseChatUserItemResponse[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ChatService.getUsersInCourse(courseId);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getUsersInCourse, loading };
}
