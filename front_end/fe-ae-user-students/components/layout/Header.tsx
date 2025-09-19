"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="h-14 border-b sticky top-0 z-40 bg-white/80 backdrop-blur container-px flex items-center justify-between">
      <Link href="/" className="font-bold">AI Enhance</Link>
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/assignments">Assignments</Link>
        <Link href="/grades">Grades</Link>
        <Link href="/deadlines">Deadlines</Link>
        <Link href="/notifications">Notifications</Link>
        <Link href="/chat">Chat</Link>
      </nav>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-black/70 hidden sm:inline">{user.name}</span>
            <button className="btn btn-outline h-9" onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary h-9">Đăng nhập</Link>
        )}
      </div>
    </header>
  );
}
