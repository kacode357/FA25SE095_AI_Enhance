"use client";

import LogoLoader from "@/components/common/logo-loader";
import { motion } from "framer-motion";
import React from "react";
import clsx from "clsx";

type MotionButtonBase = React.ComponentPropsWithoutRef<typeof motion.button>;

type Props = MotionButtonBase & {
  variant?: "primary" | "ghost" | "outline" | "secondary" | "default" | "destructive";
  loading?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "default";
  children?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: Props) {
  const sizeClass =
    {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
      icon: "btn-icon",
      default: "btn-md",
    }[size] ?? "btn-md";

  const variantClass =
    {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      default: "btn-default",
      destructive: "btn-destructive",
    }[variant] ?? "btn-primary";

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={clsx("btn", sizeClass, variantClass, loading && "is-loading", className)}
      {...props}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || disabled ? true : undefined}
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

export default Button;
