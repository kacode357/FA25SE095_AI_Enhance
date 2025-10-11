"use client";
import React from "react";

type Props = {
  children: React.ReactNode; // filter controls (left area)
  rightSlot?: React.ReactNode; // actions or meta (right area)
  className?: string;
};

export default function FilterToolbar({ children, rightSlot, className }: Props) {
  return (
    <div
      className={
        "w-full sticky top-0 z-10 bg-white/95 supports-[backdrop-filter]:backdrop-blur border-y border-slate-200 px-3 py-2 " +
        (className || "")
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {children}
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
}
