// app/student/components/CourseCodeSearch.tsx
"use client";

import { KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Search } from "lucide-react";
import { useCourseByUniqueCode } from "@/hooks/course/useCourseByUniqueCode";

export default function CourseCodeSearch() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const { loading, searchByCode } = useCourseByUniqueCode();

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || loading) return;

    const res = await searchByCode(trimmed);
    if (!res) return;

    router.push(`/student/courses/search-by-code/${res.course.id}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1 shadow-sm"
      style={{ minWidth: 230, maxWidth: 280 }}
    >
      <KeyRound className="w-4 h-4 text-slate-500" />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        placeholder="Enter course code (A1B2C3)"
        className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400"
        aria-label="Search course by unique code"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center justify-center rounded-lg px-2 py-1 disabled:opacity-60"
        style={{
          background: "var(--brand)",
          color: "#fff",
        }}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Search className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
