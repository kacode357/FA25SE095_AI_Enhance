"use client";

import { ChevronRight, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateSupportRequestForm from "../components/CreateSupportRequestForm";

function BreadcrumbCreateSupport({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden">
      <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
        <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
          <Wrench className="size-3.5" />
          <button
            onClick={() => router.push("/lecturer/course/support-requests")}
            className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
          >
            Support Requests
          </button>
        </li>
        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
        <li className="font-medium cursor-text text-slate-900 max-w-[150px] truncate">Create Support Request</li>
      </ol>
    </nav>
  );
}

export default function Page() {
  const router = useRouter();

  return (
    <div className="py-4 pl-3 pr-6 gap-2">
      <div className="sticky top-0 z-30 backdrop-blur w-full pb-3 pt-1 flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">Create Support Request</h1>
        <BreadcrumbCreateSupport router={router} />
      </div>

      <CreateSupportRequestForm />
    </div>
  );
}
