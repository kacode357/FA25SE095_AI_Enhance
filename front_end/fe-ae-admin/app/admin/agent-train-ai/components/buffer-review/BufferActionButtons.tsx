"use client";

import React from "react";

interface BufferActionButtonsProps {
  jobId: string;
  onCommit: (jobId: string) => void;
  onCommitWithFeedback: (jobId: string) => void;
  onNegativeExample: (jobId: string) => void;
  onDiscard: (jobId: string) => void;
  isLoading?: boolean;
}

export const BufferActionButtons: React.FC<BufferActionButtonsProps> = ({
  jobId,
  onCommit,
  onCommitWithFeedback,
  onNegativeExample,
  onDiscard,
  isLoading = false,
}) => {
  return (
    <>
      <ActionButton
        label="Commit"
        variant="primary"
        onClick={() => onCommit(jobId)}
        disabled={isLoading}
      />
      <ActionButton
        label="Commit + feedback"
        variant="success"
        onClick={() => onCommitWithFeedback(jobId)}
        disabled={isLoading}
      />
      <ActionButton
        label="Negative example"
        variant="ghost"
        onClick={() => onNegativeExample(jobId)}
        disabled={isLoading}
      />
      <ActionButton
        label="Discard"
        variant="danger"
        onClick={() => onDiscard(jobId)}
        disabled={isLoading}
      />
    </>
  );
};

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "success" | "danger" | "ghost" | "default";
  disabled?: boolean;
  loading?: boolean;
  size?: "xs" | "sm";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = "default",
  disabled,
  loading,
  size = "xs",
}) => {
  const sizeClasses = size === "sm" ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs";
  const variantClasses: Record<string, string> = {
    default: `btn-table ${sizeClasses}`,
    primary: `btn btn-blue-slow text-white ${sizeClasses}`,
    success: `btn btn-green-slow text-white ${sizeClasses}`,
    danger: `btn btn-red-slow text-white ${sizeClasses}`,
    ghost: `btn btn-yellow-slow text-white ${sizeClasses}`,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition ${variantClasses[variant]} disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={disabled || loading}
    >
      {loading ? "Loading..." : label}
    </button>
  );
};

export { ActionButton as BufferActionButton };

export default BufferActionButtons;
