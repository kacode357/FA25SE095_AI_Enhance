"use client";

import { useParams, useSearchParams } from "next/navigation";
import MessagesScreen from "./components/MessagesScreen";

export default function CourseMessagesPage() {
    const params = useParams();
    const search = useSearchParams();
    const courseId = String(params?.id || "");
    const courseName = search?.get("courseName") || undefined;
    return <MessagesScreen courseId={courseId} courseName={courseName} />;
}
