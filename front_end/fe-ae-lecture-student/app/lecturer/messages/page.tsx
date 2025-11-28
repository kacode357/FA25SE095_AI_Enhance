"use client";

import MessagesScreen from "@/app/lecturer/messages/components/MessagesScreen";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useEffect, useState } from "react";

export default function LecturerCourseMessagesPage() {
  const { listData: courses, loading: loadingCourses, fetchMyCourses } = useMyCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // load lecturer courses for filter
    fetchMyCourses({ asLecturer: true, page: 1, pageSize: 100 }).catch(() => {});
  }, [fetchMyCourses]);

  return (
    <div className="w-full p-4">
      <MessagesScreen
        courses={courses}
        loadingCourses={loadingCourses}
        selectedCourseId={selectedCourseId}
        onChangeCourseId={(id?: string) => setSelectedCourseId(id)}
      />
    </div>
  );
}
