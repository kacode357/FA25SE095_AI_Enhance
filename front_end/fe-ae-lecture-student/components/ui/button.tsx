"use client";

import LogoLoader from "@/components/common/logo-loader";
import { motion } from "framer-motion";
import React from "react";

type MotionButtonBase = React.ComponentPropsWithoutRef<typeof motion.button>;
type Props = MotionButtonBase & {
  variant?: "primary" | "ghost";
  loading?: boolean;
  children?: React.ReactNode;
};

export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  ...props
}: Props) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${loading ? "opacity-90" : ""} ${className}`}
      {...props}
  disabled={loading || props.disabled}
  aria-busy={loading}
  aria-disabled={loading || props.disabled ? true : undefined}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LogoLoader size={20} />
          {children}
        </span>
      ) : (
        <>
          {children}
        </>
      )}
    </motion.button>
  );
}

export default Button;

