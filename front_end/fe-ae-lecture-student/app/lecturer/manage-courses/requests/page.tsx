"use client";

import CourseRequests from "@/app/lecturer/course/components/CourseRequests";
import { useSearchParams } from "next/navigation";

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const refreshKey = searchParams?.get("refresh") || "0";
  return <CourseRequests key={refreshKey} active={true} />;
}
