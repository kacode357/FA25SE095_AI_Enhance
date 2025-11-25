// components/layout/Header.tsx
"use client";

import Logo from "@/components/logo/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { CircleArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const { logout, loading: logoutLoading } = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const main = document.querySelector("main") as HTMLElement | null;

    const readAnyScroll = () => {
      const winY = typeof window !== "undefined" ? window.scrollY || 0 : 0;
      const mainY = main ? main.scrollTop || 0 : 0;
      const docY = document.documentElement?.scrollTop || document.body?.scrollTop || 0;
      return Math.max(winY, mainY, docY);
    };

    const onScroll = () => {
      setScrolled(readAnyScroll() > 20);
    };

    // initial
    onScroll();

    // attach listeners
    window.addEventListener("scroll", onScroll, { passive: true });
    if (main) main.addEventListener("scroll", onScroll, { passive: true });

    let observer: IntersectionObserver | null = null;
    try {
      const headerEl = headerRef.current as HTMLElement | null;
      const sentinel = (main && main.firstElementChild) || document.body.firstElementChild;
      if (sentinel && headerEl && 'IntersectionObserver' in window) {
        const offset = headerEl.offsetHeight || 64;
        observer = new IntersectionObserver(
          (entries) => {
            const e = entries[0];
            // if sentinel is not intersecting (scrolled past), mark scrolled true
            setScrolled(!e.isIntersecting);
          },
          { root: null, rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 }
        );
        observer.observe(sentinel as Element);
      }
    } catch (err) {
      // ignore observer errors
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (main) main.removeEventListener("scroll", onScroll);
      if (observer) observer.disconnect();
    };
  }, []);
  return (
    <header
      ref={headerRef}
      className={`fixed top-0 w-full h-16 z-[99] backdrop-blur-sm transition-colors duration-200 ${
        scrolled ? "bg-white" : "bg-transparent"
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
