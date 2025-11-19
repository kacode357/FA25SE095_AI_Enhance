"use client";

import LogoLoader from "@/components/common/logo-loader";
import { motion } from "framer-motion";
import React from "react";

type MotionButtonBase = React.ComponentPropsWithoutRef<typeof motion.button>;

type Variant = "primary" | "ghost" | "outline" | "secondary" | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "default";

type ButtonProps = MotionButtonBase & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
  // Size styles
  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-xs"
      : size === "lg"
      ? "h-11 px-5 text-base"
      : size === "icon"
      ? "h-9 w-9 p-0"
      : "h-9 px-4 text-sm"; // md/default

  // Variant styles
  const variantClasses =
    variant === "primary"
      ? "bg-green-600 hover:bg-green-700 text-white"
      : variant === "outline"
      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      : variant === "secondary"
      ? "bg-gray-600 hover:bg-gray-700 text-white"
      : variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : // ghost
        "bg-transparent text-gray-700 hover:bg-gray-100";

  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 " +
    "disabled:opacity-60 disabled:pointer-events-none";

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || props.disabled}
        aria-busy={loading}
        aria-disabled={loading || props.disabled ? true : undefined}
        className={`${base} ${variantClasses} ${sizeClasses} ${
          loading ? "opacity-90" : ""
        } ${className}`}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <LogoLoader size={18} />
            {children}
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
