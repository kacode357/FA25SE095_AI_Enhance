"use client";

import LogoLoader from "@/components/common/logo-loader";
import { motion } from "framer-motion";
import React from "react";

type MotionButtonBase = React.ComponentPropsWithoutRef<typeof motion.button>;
type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "ghost" | "outline";

type Props = MotionButtonBase & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
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
  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-xs"
      : size === "lg"
      ? "h-12 px-6 text-base"
      : "h-10 px-4 text-sm";

  const variantClasses =
    variant === "primary"
      ? "btn-primary"
      : variant === "outline"
      ? "btn-outline"
      : "btn-ghost";

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`btn ${variantClasses} ${sizeClasses} ${
        loading ? "opacity-90" : ""
      } ${className}`}
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
