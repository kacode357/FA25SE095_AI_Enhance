"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
};

export default function Button({
  className = "",
  variant = "primary",
  loading,
  children,
  ...props
}: Props) {
  return (
    <button
      className={`btn ${variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : "btn-ghost"} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-4 rounded-full border-2 border-white/70 border-r-transparent animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
