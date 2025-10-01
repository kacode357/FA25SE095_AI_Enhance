"use client";
import { ReactNode } from "react";

export function ActionBar({ children }: { children: ReactNode }){
  return (
    <div className="flex flex-wrap gap-2 items-center px-3 py-2 bg-white border-b border-slate-200">{children}</div>
  );
}
