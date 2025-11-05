"use client";

import clsx from "clsx";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

export type RevealDirection = "up" | "down" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number; // seconds
  duration?: number; // seconds
  amount?: number; // viewport amount 0..1
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 1.2,
  amount = 0.18,
  once = true,
}: RevealProps) {
  const distance = 14; // px (subtle motion)
  const offset =
    direction === "left"
      ? { x: -distance, y: 0 }
      : direction === "right"
      ? { x: distance, y: 0 }
      : direction === "down"
      ? { x: 0, y: -distance }
      : { x: 0, y: distance }; // "up"

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    shown: { opacity: 1, x: 0, y: 0 },
  };

  // Slow down right after page becomes interactive so users can perceive the motion better
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const justLoaded = typeof performance !== "undefined" && performance.now() < 3500;
    if (justLoaded) {
      setSlow(true);
      const t = window.setTimeout(() => setSlow(false), 2200);
      return () => window.clearTimeout(t);
    }
  }, []);

  const mult = slow ? 2 : 1;
  const extraDelay = slow ? 0.15 : 0;

  return (
    <motion.div
      className={clsx(className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ duration: duration * mult, delay: delay + extraDelay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
