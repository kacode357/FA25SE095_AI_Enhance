"use client";

import LogoLoader from "@/components/common/logo-loader";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

export type ButtonProps = HTMLMotionProps<"button"> & {
  variant?:
    | "primary"
    | "gradient"
    | "ghost"
    | "outline"
    | "secondary"
    | "default"
    | "destructive"
    | "link";

  loading?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "default";
  children?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClass =
      {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
        default: "px-4 py-2 text-base",
      }[size] ?? "px-4 py-2 text-base";

    const variantClass =
      variant === "gradient"
        ? "btn-gradient"
        : variant === "primary"
        ? "btn-primary"
        : "btn-ghost"; // tuỳ bạn map thêm outline/secondary/... nếu muốn

    const isDisabled = loading || props.disabled;

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "btn",
          variantClass,
          sizeClass,
          isDisabled ? "opacity-50 pointer-events-none cursor-not-allowed" : loading ? "opacity-90" : "",
          className
        )}
        {...props}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled ? true : undefined}
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
);

Button.displayName = "Button";

export default Button;
