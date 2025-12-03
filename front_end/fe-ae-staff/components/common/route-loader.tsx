"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const MIN_VISIBLE_MS = 400;

export default function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = useMemo(() => `${pathname}?${searchParams?.toString() ?? ""}`, [pathname, searchParams]);

  const firstMountRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(true); // show on initial load

  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      // Hide after initial delay
      timeoutRef.current = window.setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
      return () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      };
    }
  }, []);

  useEffect(() => {
    // On route key change, show briefly
    setVisible(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [key]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-1000 flex items-center justify-center bg-transparent"
          aria-live="polite"
          role="status"
        >
          {/* Loader intentionally removed */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
