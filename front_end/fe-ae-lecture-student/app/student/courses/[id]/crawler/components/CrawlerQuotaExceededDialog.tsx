"use client";

import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
};

const CrawlerQuotaExceededDialog = ({ open, onOpenChange, message }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crawl quota reached</DialogTitle>
          <DialogDescription>
            {message ||
              "Your crawl quota is exhausted. Please upgrade your plan to continue."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn h-9 px-4 text-[11px] font-semibold"
          >
            Close
          </button>
          <Link
            href="/student/subscription"
            className="btn btn-blue-slow h-9 px-4 text-[11px] font-semibold"
          >
            Upgrade plan
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrawlerQuotaExceededDialog;
