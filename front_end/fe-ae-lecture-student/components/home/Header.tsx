// components/layout/Header.tsx
"use client";

import Logo from "@/components/logo/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { CircleArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const { logout, loading: logoutLoading } = useLogout();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      setScrolled(window.scrollY > 20);
    };

    // set initial state
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 w-full h-16 z-[99] backdrop-blur-sm transition-colors duration-200 ${
        scrolled ? "bg-white/95" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full w-full items-center gap-6 max-w-[1400px] pl-8">
        {/* Left: logo */}
        <div className="flex items-center gap-8 min-w-0">
          <Logo />
        </div>

        {/* Right: Login button or welcome */}
        <div className="ml-auto mr-10">
          {user ? (
            <div className="inline-flex items-center gap-3">
              {user.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePictureUrl}
                  alt="avatar"
                  className={`w-8 h-8 rounded-full object-cover transition-shadow duration-200 ${
                    scrolled ? "ring-0" : "ring-2 ring-white/80"
                  }`}
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full bg-violet-100 text-indigo-700 flex items-center justify-center font-medium transition-shadow duration-200 ${
                    scrolled ? "ring-0" : "ring-2 ring-white/80"
                  }`}
                >
                  {user.firstName?.charAt(0) ?? "U"}
                </div>
              )}

              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className={`text-xs ${scrolled ? "text-gray-600" : "text-gray-500"} hidden sm:inline`}>
                  Welcome,
                </span>

                <span className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${scrolled ? "text-violet-800" : "text-violet-900"}`}>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                    {`${user.firstName} ${user.lastName}`}
                  </span>
                  <span aria-hidden className="text-sm">👋</span>
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  disabled={logoutLoading}
                  className={`ml-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium px-3 py-1 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                    scrolled
                      ? "bg-white text-violet-700 border border-violet-100 shadow-sm"
                      : "bg-white/90 text-violet-700 border border-white/30"
                  }`}
                >
                  Logout <CircleArrowOutUpRight className="size-3" />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn btn-gradient-slow cursor-pointer">
              Login
            </Link>
          )}
        </div>
      </div>
      
    </header>
  );
}
