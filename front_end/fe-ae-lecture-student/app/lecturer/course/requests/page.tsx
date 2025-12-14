"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import CourseRequests from "../components/CourseRequests";


export default function CourseRequestsPage() {
  const router = useRouter();

  return (
    <div className="flex-1 min-h-0">
      <div className="">
        <div className="sticky top-0 z-30 backdrop-blur w-full pl-3 pr-5 py-3 flex items-center justify-between">
          <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">Courses Requests Management</h1>
          <div className="ml-auto">
            <Button
              onClick={() => router.push("/lecturer/manage-courses/requests/create")}
              className="btn btn-gradient text-white"
              size="sm"
            >
              <Plus className="size-4" />
              New Request
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-4rem-3.25rem)] flex flex-col gap-2 mr-5 pl-3">
          <div className="flex-1 overflow-y-auto border border-slate-200 rounded-sm p-2">
            <CourseRequests active />
          </div>
        </div>
      </div>
    </div>
  );
}
