"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, 
  Eye, 
  Ban, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import Component Date Time Picker
import { DateTimePicker } from "@/components/ui/date-time-picker";

import { useSuspendAdminUser } from "@/hooks/admin/useSuspendAdminUser";
import { useReactivateAdminUser } from "@/hooks/admin/useReactivateAdminUser";
import type { AdminUserItem } from "@/types/admin/admin-user.response";
import { AdminUserStatusFilter } from "@/types/admin/admin-user.payload";

type Props = {
  user: AdminUserItem;
  onRefresh: () => void;
};

export default function UserActionMenu({ user, onRefresh }: Props) {
  const router = useRouter();
  
  // State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);

  // Form State
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState<string | undefined>(undefined);

  // Hooks
  const { suspendAdminUser, loading: suspendLoading } = useSuspendAdminUser();
  const { reactivateAdminUser, loading: reactivateLoading } = useReactivateAdminUser();

  // --- LOGIC CHECK STATUS ---
  // Check xem user có đang bị Suspend hoặc Deleted không
  const isSuspendedOrDeleted = 
    (user.status as any) === AdminUserStatusFilter.Suspended || 
    (user.status as any) === AdminUserStatusFilter.Deleted ||
    user.status === "Suspended" || 
    user.status === "Deleted";

  // --- ACTIONS ---

  const handleViewDetail = () => {
    setIsMenuOpen(false);
    router.push(`/admin/students/${user.id}`);
  };

  const openSuspendDialog = () => {
    setIsMenuOpen(false);
    setIsSuspendOpen(true);
  };

  const openReactivateDialog = () => {
    setIsMenuOpen(false);
    setIsReactivateOpen(true);
  };

  const handleSuspendSubmit = async () => {
    if (!suspendReason.trim()) return;

    try {
      await suspendAdminUser(user.id, {
        reason: suspendReason,
        suspendUntil: suspendUntil || null,
      });
      
      setIsSuspendOpen(false);
      setSuspendReason("");
      setSuspendUntil(undefined);
      onRefresh(); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleReactivateSubmit = async () => {
    try {
      await reactivateAdminUser(user.id);
      setIsReactivateOpen(false);
      onRefresh(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* --- MENU DROPDOWN --- */}
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="h-9 w-9 rounded-2xl bg-[#efeaff] flex items-center justify-center shadow-sm hover:bg-[#e2d7ff] transition focus:outline-none"
          >
            <MoreHorizontal className="h-4 w-4 text-brand" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl border border-[var(--border)] shadow-lg bg-white">
          <DropdownMenuItem onClick={handleViewDetail} className="cursor-pointer gap-2">
            <Eye className="h-4 w-4" /> Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* 🟢 LOGIC MỚI: Chỉ hiện nút Suspend nếu User CHƯA bị Suspend/Delete */}
          {!isSuspendedOrDeleted && (
            <DropdownMenuItem 
              onClick={openSuspendDialog}
              className="cursor-pointer gap-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50"
            >
              <Ban className="h-4 w-4" /> Suspend User
            </DropdownMenuItem>
          )}

          {/* Chỉ hiện nút Reactivate nếu User ĐANG bị Suspend/Delete */}
          {isSuspendedOrDeleted && (
            <DropdownMenuItem 
              onClick={openReactivateDialog}
              className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
            >
              <RotateCcw className="h-4 w-4" /> Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- DIALOG 1: SUSPEND --- */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 text-lg">
              <AlertTriangle className="h-5 w-5" /> Suspend User Account
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              This action will restrict the user&apos;s access. You must provide a reason.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason" className="font-medium text-slate-700">Reason (Required)</Label>
              <Textarea
                id="reason"
                placeholder="Violation of terms, spamming, etc."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="resize-none min-h-[80px] border-slate-200 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="font-medium text-slate-700">Suspend Until (Optional)</Label>
              <DateTimePicker
                value={suspendUntil}
                onChange={setSuspendUntil}
                placeholder="Select date (Indefinite if empty)"
                minDate={new Date()}
                className="w-full"
              />
              <p className="text-[11px] text-slate-400 italic">
                Leave empty for indefinite suspension.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsSuspendOpen(false)}
              disabled={suspendLoading}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSuspendSubmit}
              disabled={suspendLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white border-none"
            >
              {suspendLoading ? "Suspending..." : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG 2: REACTIVATE --- */}
      <Dialog open={isReactivateOpen} onOpenChange={setIsReactivateOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 text-lg">
              <CheckCircle2 className="h-5 w-5" /> Reactivate User
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2">
              Are you sure you want to reactivate this user? 
              <br/>
              They will regain access to their account immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsReactivateOpen(false)}
              disabled={reactivateLoading}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReactivateSubmit}
              disabled={reactivateLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            >
              {reactivateLoading ? "Processing..." : "Confirm Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
