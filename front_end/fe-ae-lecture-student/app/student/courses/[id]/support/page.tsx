// app/student/courses/[id]/support/page.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Headset } from "lucide-react";

import { SupportRequestCreate } from "./components/SupportRequestCreate";
import { SupportRequestList } from "./components/SupportRequestList";

export default function CourseSupportPage() {
  const params = useParams();
  const courseId = useMemo(() => {
    const id = params?.id;
    return typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  }, [params]);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (!courseId) {
    // In theory this shouldn't happen if route is /student/courses/[id]/support
    return (
      <div className="py-6">
        <p className="text-sm text-red-500">Course ID is missing.</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
   

      {/* Create + List */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <SupportRequestCreate courseId={courseId} onCreated={handleCreated} />
        <SupportRequestList courseId={courseId} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
