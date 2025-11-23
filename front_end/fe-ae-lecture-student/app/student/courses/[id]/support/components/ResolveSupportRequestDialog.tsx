"use client";

type ResolveSupportRequestDialogProps = {
  open: boolean;
  peerName: string;
  resolving: boolean;
  onConfirmResolved: () => void;
  onNotResolved: () => void;
};

const cx = (...a: Array<string | false | undefined>) =>
  a.filter(Boolean).join(" ");

export default function ResolveSupportRequestDialog({
  open,
  peerName,
  resolving,
  onConfirmResolved,
  onNotResolved,
}: ResolveSupportRequestDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="card max-w-md w-full px-6 py-5 text-center">
        <h2 className="mb-2 text-lg font-semibold text-nav">
          Has your need been resolved?
        </h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          This question is from{" "}
          <span className="font-medium text-brand">{peerName}</span>. If your
          support request is already solved, we will close this chat and you
          won&apos;t be able to send more messages.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            type="button"
            onClick={onConfirmResolved}
            disabled={resolving}
            className={cx(
              "btn btn-green-slow min-w-[140px] text-sm",
              resolving && "opacity-60 cursor-not-allowed",
            )}
          >
            {resolving ? "Confirming..." : "Yes, it’s resolved"}
          </button>

          <button
            type="button"
            onClick={onNotResolved}
            disabled={resolving}
            className="btn btn-yellow-slow min-w-[160px] text-sm"
          >
            No, I still need help
          </button>
        </div>
      </div>
    </div>
  );
}
