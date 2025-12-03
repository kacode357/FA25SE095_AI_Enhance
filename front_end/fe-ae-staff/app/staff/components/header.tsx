"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useNotificationHub } from "@/hooks/hubnotification/useNotificationHub";
import { useGetNotifications } from "@/hooks/notifications/useGetNotifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/notifications/useMarkAllNotificationsAsRead";
import { useMarkNotificationAsRead } from "@/hooks/notifications/useMarkNotificationAsRead";
import { useUnreadNotificationsCount } from "@/hooks/notifications/useUnreadNotificationsCount";
import type { NotificationItem } from "@/types/notifications/notifications.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import Cookies from "js-cookie";
import {
  Bell,
  ChevronDown,
  CircleArrowOutUpRight,
  KeySquare,
  Menu,
  ShieldUser,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = { onMenuClick?: () => void };

export default function ManagerHeader({ onMenuClick }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 🔥 FIX: Dùng Ref để lưu trạng thái hiện tại, tránh re-render hàm callback
  const notificationOpenRef = useRef(notificationOpen);
  const userRef = useRef<any>(null);

  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAuth();
  
  // 🔥 FIX: Cập nhật Ref khi state thay đổi
  useEffect(() => {
    notificationOpenRef.current = notificationOpen;
  }, [notificationOpen]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const { logout, loading } = useLogout();
  const { getUnreadNotificationsCount } = useUnreadNotificationsCount();
  const { getNotifications } = useGetNotifications();
  const { markNotificationAsRead } = useMarkNotificationAsRead();
  const { markAllNotificationsAsRead } = useMarkAllNotificationsAsRead();

  // ===== Hub integration for realtime notifications =====
  const getTokenForHub = useCallback(() => {
    return getSavedAccessToken() || "";
  }, []);

  // 🔥 FIX: Dependency array để rỗng [], dùng ref.current bên trong
  const handleHubNotification = useCallback((raw: any) => {
    // Lấy giá trị mới nhất từ Ref
    const isCurrentlyOpen = notificationOpenRef.current;
    const currentUser = userRef.current;

    const item = {
      id: raw?.id ?? raw?.notificationId ?? `${Date.now()}-${Math.random()}`,
      userId: raw?.userId ?? currentUser?.id ?? "",
      relatedEntityId: raw?.relatedEntityId ?? null,
      title: raw?.title ?? raw?.subject ?? raw?.content ?? "",
      content: raw?.content ?? raw?.message ?? raw?.body ?? "",
      type: raw?.type ?? 0,
      priority: raw?.priority ?? 0,
      source: raw?.source ?? 0,
      isRead: typeof raw?.isRead === "boolean" ? raw.isRead : false,
      readAt: raw?.readAt ?? null,
      expiresAt: raw?.expiresAt ?? null,
      metadataJson: raw?.metadataJson ?? null,
      isDeleted: false,
      deletedAt: null,
      deliveryLogs: raw?.deliveryLogs ?? [],
      createdBy: raw?.createdBy ?? null,
      updatedBy: raw?.updatedBy ?? null,
      createdAt: raw?.createdAt ?? new Date().toISOString(),
      updatedAt: raw?.updatedAt ?? null,
      domainEvents: raw?.domainEvents ?? [],
    } as NotificationItem;

    // Logic xử lý vẫn giữ nguyên
    const toInsert = isCurrentlyOpen ? { ...item, isRead: true } : item;
    setNotifications((prev) => [toInsert, ...prev]);
    if (!isCurrentlyOpen) setUnreadCount((prev) => prev + (item.isRead ? 0 : 1));
  }, []); // <--- Quan trọng: Rỗng để function không đổi reference

  const { connect, disconnect, connected, connecting, lastError } = useNotificationHub({
    getAccessToken: getTokenForHub,
    onNotification: handleHubNotification,
  });

  const pathname = usePathname();

  // close dropdowns when navigation occurs
  useEffect(() => {
    setDropdownOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    try {
      disconnect();
    } catch { }

    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get("accessToken") || "",
      logoutAllDevices: false,
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getUnreadNotificationsCount();
      if (mounted && typeof c === "number") setUnreadCount(c);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // connect to hub when user present
  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    if (!token) return;

    connect().catch(() => {
      // ignore connect errors
    });

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownOpen) return;
      const target = e.target as Node;
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      const clickedOnButton = profileButtonRef.current && profileButtonRef.current.contains(target);
      if (!clickedInsideDropdown && !clickedOnButton) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const openNotifications = async () => {
    const willOpen = !notificationOpen;
    setNotificationOpen(willOpen);

    if (willOpen) {
      const list = await getNotifications({ take: 50 });
      if (list) {
        const normalized = list.map((n: any) => ({
          id: n.id,
          title: n.title ?? n.content ?? "",
          content: n.content ?? n.body ?? "",
          createdAt: n.createdAt ?? new Date().toISOString(),
          isRead: !!n.isRead || !!n.read,
        } as NotificationItem));

        const updated = normalized.map((x) => ({ ...x, isRead: true }));
        setNotifications(updated);
        setUnreadCount(0);

        markAllNotificationsAsRead().catch(() => { });
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsRead(id);
    if (res && res.success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const cnt = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(cnt);
  }, [notifications]);

  // ... Phần Return JSX giữ nguyên ...
  return (
    <header className="h-20 bg-white backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 sm:px-2">
        {/* Brand Section */}
        <div className="flex items-center gap-3 sm:gap-14">
          <button
            type="button"
            aria-label="Open sidebar"
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <Link
            href="/staff/terms"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
            aria-label="AIDS-LMS"
          >
            <div className="relative">
              <Image
                src="/short-logo-aids.png"
                alt="AIDS-LMS"
                width={32}
                height={32}
                className="drop-shadow-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                AIDS-LMS
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Staff Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {/* Notifications */}
          <div className="relative cursor-pointer">
            <button
              onClick={openNotifications}
              className="relative inline-flex items-center justify-center p-0 cursor-pointer bg-transparent border-0"
              aria-label="Notifications"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-md shadow-sm">
                <Bell className="w-5 h-5 text-gray-600" />
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 z-50 inline-flex items-center justify-center w-5 h-5 bg-orange-400 text-white text-xs font-bold rounded-full border-2 border-white shadow">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <span className={`text-[11px] mt-0.5 ${connecting ? "text-blue-600" : connected ? "text-emerald-600" : lastError ? "text-red-500" : "text-red-500"}`}>
                    {connecting ? "Connecting..." : connected ? "Connected" : lastError ? "Error" : "Disconnected"}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No announcement yet</div>
                  )}
                  {notifications.map((n) => {
                    const contentStr = (n.content as string) ?? (n as any).message ?? "";
                    const lower = contentStr.toLowerCase();
                    const marker = "course:";
                    const idx = lower.indexOf(marker);

                    const messageLine = idx >= 0 ? contentStr.slice(0, idx + marker.length).trim() : contentStr;
                    const courseLine = idx >= 0 ? contentStr.slice(idx + marker.length).trim() : "";

                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start justify-between ${n.isRead ? "" : "bg-white"}`}
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800">{n.title || "New notification"}</p>
                          {messageLine && (
                            <p className="text-xs text-gray-500 mt-1">{messageLine}</p>
                          )}
                          {courseLine && (
                            <p className="text-sm text-gray-700 mt-2 break-words">{courseLine}</p>
                          )}
                          {n.createdAt && (
                            <p className="text-[11px] mt-2 text-right text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                          )}
                        </div>
                        {!n.isRead && <span className="ml-3 w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative cursor-pointer">
            <button
              ref={profileButtonRef}
              className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:shadow-md transition-all"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user
                    ? user.firstName[0] + user.lastName[0]
                    : "ST"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user
                    ? `${user.firstName} ${user.lastName}`
                    : "Staff User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? user.role : "Staff"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {dropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold cursor-text text-gray-900">
                    {user
                      ? `${user.firstName} ${user.lastName}`
                      : "Staff Tran"}
                  </p>
                  <p className="text-sm cursor-text text-gray-500">
                    {user ? user.email : "staff.tran@university.edu"}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/staff/profile/my-profile"
                    className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShieldUser className="w-4 h-4" />
                    Personal profile
                  </Link>
                  <Link
                    href="/staff/profile/change-password"
                    className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <KeySquare className="w-4 h-4" />
                    Change Password
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    <CircleArrowOutUpRight className="w-4 h-4" />
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}