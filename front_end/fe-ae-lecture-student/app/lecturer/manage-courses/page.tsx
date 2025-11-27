"use client";

import CourseRequests from "@/app/lecturer/course/components/CourseRequests";

export default function ManageCoursesIndexPage() {
  // Default view for /lecturer/manage-courses is the requests view
  return <CourseRequests active={true} />;
}
