"use client";


export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 " +
        (className ?? "h-4 w-full")
      }
    />
  );
}
