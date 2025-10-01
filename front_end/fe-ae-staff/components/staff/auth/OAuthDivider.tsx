"use client";

export function OAuthDivider(){
  return (
    <div className="relative my-6">
      <div className="border-t border-slate-200" />
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[11px] tracking-wide text-slate-500 uppercase font-medium">
        Or
      </span>
    </div>
  );
}
