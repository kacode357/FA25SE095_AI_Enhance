// components/layout/Header.tsx
"use client";

import Logo from "@/components/logo/Logo";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className="fixed top-0 z-40 w-full h-16 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.72)",
      }}
    >
      <div
        className="mx-auto flex h-full w-full items-center gap-6"
        style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
      >
        {/* Left: logo */}
        <div className="flex items-center gap-8 min-w-0">
          <Logo />
        </div>

        {/* Right: Login button */}
        <div className="ml-auto mr-10">
          <Link href="/login" className="btn btn-gradient-slow">
            Login
          </Link>
        </div>
      </div>
      
    </header>
  );
}
