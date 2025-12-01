"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  Settings, 
  User, 
  MoreVertical 
} from "lucide-react";
import { clsx } from "clsx";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { loadDecodedUser } from "@/utils/secure-user";
import type { UserProfile } from "@/types/user/user.response";

// ✅ Import Hook Logout
import { useLogout } from "@/hooks/auth/useLogout";

type UserMenuProps = {
  showUserInfo?: boolean;
};

export default function UserMenu({ showUserInfo = false }: UserMenuProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Gọi hook logout
  const { logout, loading: logoutLoading } = useLogout();

  // 1. Load User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await loadDecodedUser();
        if (profile) setUser(profile);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 2. Actions: Thay thế logic cũ bằng hook
  const handleLogout = async () => {
    // Gọi hook logout (Hook này tự lo clear cookie, session và redirect)
    await logout(); 
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  if (loading) return <Skeleton className="h-10 w-10 rounded-full" />;
  if (!user) return null;

  return (
    <div className={clsx("flex items-center", showUserInfo ? "w-full gap-3" : "justify-center")}>
      
      {/* --- CASE 1: SIDEBAR ĐÓNG --- */}
      {!showUserInfo ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0 border border-slate-200 hover:bg-slate-100">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profilePictureUrl || ""} alt={user.fullName || ""} />
                <AvatarFallback className="bg-brand/10 text-brand font-bold text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <UserMenuContent 
            user={user} 
            onLogout={handleLogout} 
            isLoggingOut={logoutLoading} 
            router={router} 
          />
        </DropdownMenu>
      ) : (
        /* --- CASE 2: SIDEBAR MỞ --- */
        <>
          <div className="flex items-center gap-3 flex-1 overflow-hidden select-none">
            <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
              <AvatarImage src={user.profilePictureUrl || ""} alt={user.fullName || ""} />
              <AvatarFallback className="bg-brand/10 text-brand font-bold text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate leading-tight">
                {user.fullName || "Admin User"}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-medium">
                {user.email}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-brand hover:border-brand/30 hover:bg-brand/5 transition-all shadow-sm shrink-0"
                title="User Menu"
              >
                <MoreVertical className="h-7 w-7" /> 
              </Button>
            </DropdownMenuTrigger>
            
            <UserMenuContent 
              user={user} 
              onLogout={handleLogout} 
              isLoggingOut={logoutLoading} 
              router={router} 
            />
          </DropdownMenu>
        </>
      )}
    </div>
  );
}

// --- SUB COMPONENT ---
type ContentProps = { 
  user: UserProfile; 
  onLogout: () => void; 
  isLoggingOut: boolean; // ✅ Nhận state loading
  router: any;
};

function UserMenuContent({ user, onLogout, isLoggingOut, router }: ContentProps) {
  return (
    <DropdownMenuContent 
      className="w-60 bg-white border border-slate-200 shadow-xl z-[100]" 
      align="end" 
      side="right" 
      sideOffset={12} 
      forceMount
    >
      <DropdownMenuLabel className="font-normal p-3 bg-slate-50 border-b border-slate-100">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-semibold leading-none truncate text-slate-900">
            {user.fullName || "Admin User"}
          </p>
          <p className="text-xs leading-none text-slate-500 truncate">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      
      <div className="p-1.5 space-y-0.5">
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => router.push(`/admin/users/${user.id}`)} 
            className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md hover:bg-slate-100 focus:bg-slate-100"
          >
            <User className="h-4.5 w-4.5 text-slate-500" />
            <span className="font-medium text-slate-700">My Account</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => router.push("/admin/settings")} 
            className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md hover:bg-slate-100 focus:bg-slate-100"
          >
            <Settings className="h-4.5 w-4.5 text-slate-500" />
            <span className="font-medium text-slate-700">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        
        <DropdownMenuItem 
          onClick={onLogout} 
          disabled={isLoggingOut} // Disable khi đang call API
          className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md text-red-600 focus:text-red-700 focus:bg-red-50 hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span className="font-medium">
            {isLoggingOut ? "Logging out..." : "Log out"}
          </span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
}