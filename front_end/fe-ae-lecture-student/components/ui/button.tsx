"use client";

import LogoLoader from "@/components/common/logo-loader";
import { motion } from "framer-motion";
import React from "react";

type MotionButtonBase = React.ComponentPropsWithoutRef<typeof motion.button>;

type Props = MotionButtonBase & {
  variant?: "primary" | "gradient" | "ghost" | "outline" | "secondary" | "default" | "destructive";
  loading?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "default";
  children?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  children,
  ...props
}: Props) {
  const sizeClass = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
    default: "px-4 py-2 text-base",
  }[size];

  const variantClass =
    variant === "gradient"
      ? "btn-gradient"
      : variant === "primary"
      ? "btn-primary"
      : "btn-ghost";

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`btn ${variantClass} ${sizeClass} ${loading ? "opacity-90" : ""} ${className}`}
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
        <>{children}</>
      )}
    </motion.button>
  );
}

export default Button;
