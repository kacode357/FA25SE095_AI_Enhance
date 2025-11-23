// app/student/components/header.tsx

"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useNotificationHub } from "@/hooks/hubnotification/useNotificationHub";

import Logo from "@/components/logo/Logo";
import NotificationsMenu, {
  NotificationItem,
} from "@/components/notifications/NotificationsMenu";
import UserMenu from "@/components/user/UserMenu";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { useStudentNav } from "./nav-items";

import { useGetNotifications } from "@/hooks/notifications/useGetNotifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/notifications/useMarkAllNotificationsAsRead";

// ✅ NEW: search bằng uniqueCode tách thành component riêng
import CourseCodeSearch from "./CourseCodeSearch";

const COOKIE_ACCESS_TOKEN_KEY = "accessToken";
const NOTI_CACHE_KEY_PREFIX = "student:notifs:v1:";
const SEARCH_TOUR_STORAGE_KEY = "student:search-tour:v1";

/** Chuẩn hóa format dữ liệu để UI render */
function normalizeNotification(raw: any): NotificationItem {
  const nowIso = new Date().toISOString();

  const id =
    raw?.id ||
    raw?.notificationId ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`);

  const readFlag =
    typeof raw?.read === "boolean"
      ? raw.read
      : typeof raw?.isRead === "boolean"
      ? raw.isRead
      : false;

  return {
    id,
    title: raw?.title || raw?.subject || "New notification",
    message: raw?.message || raw?.content || raw?.body || "",
    createdAt: raw?.createdAt || raw?.timestamp || nowIso,
    read: readFlag,
  };
}

export default function Header() {
  const { user } = useAuth();
  const { logout } = useLogout();
  const navs = useStudentNav();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const { getNotifications } = useGetNotifications();
  const { markAllNotificationsAsRead } = useMarkAllNotificationsAsRead();

  /** ====== Search tour state ====== */
  const [showSearchTour, setShowSearchTour] = useState(false);
  const [searchTourStep, setSearchTourStep] = useState<1 | 2 | 3>(1);

  const finishSearchTour = useCallback(() => {
    setShowSearchTour(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SEARCH_TOUR_STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }
  }, []);

  /** ====== memo callback cho hub ====== */
  const getTokenForHub = useCallback(() => {
    return getSavedAccessToken() || "";
  }, []);

  const handleHubNotification = useCallback((raw: any) => {
    const item = normalizeNotification(raw);
    setNotifications((prev) => [item, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  /** HUB */
  const { connect, disconnect, connected, connecting, lastError } =
    useNotificationHub({
      getAccessToken: getTokenForHub,
      onNotification: handleHubNotification,
    });

  /** ===============================
   * 1️⃣ Fetch lịch sử thông báo — CHỈ 1 LẦN / USER / SESSION
   * =============================== */
  useEffect(() => {
    if (!user?.id || historyLoaded) return;

    const cacheKey = `${NOTI_CACHE_KEY_PREFIX}${user.id}`;

    // 1) Thử đọc cache từ sessionStorage trước
    try {
      if (typeof window !== "undefined") {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            notifications: NotificationItem[];
            unreadCount: number;
          };

          if (Array.isArray(parsed.notifications)) {
            setNotifications(parsed.notifications);
            setUnreadCount(parsed.unreadCount ?? 0);
            setHistoryLoaded(true);
            return; // đã có dữ liệu → khỏi gọi API
          }
        }
      }
    } catch {
      // ignore cache error
    }

    // 2) Không có cache → gọi API lần đầu, rồi cache lại
    (async () => {
      try {
        const list = await getNotifications({ take: 50 });
        if (!list) return;

        const normalized = list.map((n: any) => normalizeNotification(n));
        const unread = normalized.filter((n) => !n.read).length;

        setNotifications(normalized);
        setUnreadCount(unread);

        // Lưu cache cho lần F5 sau
        try {
          if (typeof window !== "undefined") {
            const payload = JSON.stringify({
              notifications: normalized,
              unreadCount: unread,
            });
            window.sessionStorage.setItem(cacheKey, payload);
          }
        } catch {
          // ignore cache error
        }

        setHistoryLoaded(true);
      } catch {
        // ignore API error, UI vẫn chạy bình thường
      }
    })();
  }, [user?.id, historyLoaded, getNotifications]);

  /** ===============================
   * 2️⃣ Kết nối hub — tránh spam connect/disconnect
   * =============================== */
  useEffect(() => {
    if (!user?.id) return;

    const token = getSavedAccessToken();
    if (!token) return;

    // connect 1 lần khi mount / userId thay đổi
    connect().catch(() => {
      // ignore connect error
    });

    // ✅ cleanup đúng: luôn disconnect khi unmount
    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  /** ===============================
   * 3️⃣ Logout
   * =============================== */
  const handleLogout = () => {
    setDropdownOpen(false);
    disconnect();

    logout({
      userId: user?.id ?? "",
      accessToken: Cookies.get(COOKIE_ACCESS_TOKEN_KEY) || "",
      logoutAllDevices: false,
    });
  };

  /** ===============================
   * 4️⃣ Khi mở menu notification → mark all as read
   * =============================== */
  const handleNotificationOpenChange = (v: boolean) => {
    setNotificationOpen(v);

    if (v && unreadCount > 0) {
      // cập nhật state + cache trong cùng 1 chỗ để tránh lệch dữ liệu
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));

        if (user?.id && typeof window !== "undefined") {
          const cacheKey = `${NOTI_CACHE_KEY_PREFIX}${user.id}`;
          try {
            const payload = JSON.stringify({
              notifications: updated,
              unreadCount: 0,
            });
            window.sessionStorage.setItem(cacheKey, payload);
          } catch {
            // ignore cache error
          }
        }

        return updated;
      });

      setUnreadCount(0);

      markAllNotificationsAsRead().catch(() => {
        // BE lỗi thì lần sau mở lại vẫn sẽ fetch/unread từ server
      });
    }

    if (v) setDropdownOpen(false);
  };

  /** ===============================
   * 5️⃣ Khởi động Search tour khi user mới vào
   * =============================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const seen = window.localStorage.getItem(SEARCH_TOUR_STORAGE_KEY);
      if (seen) return; // đã xem rồi → khỏi show
    } catch {
      // ignore
    }

    const timer = window.setTimeout(() => {
      setShowSearchTour(true);
      setSearchTourStep(1);
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /** Không auto next / auto close nữa — user phải tự bấm */

  const renderSearchTourText = () => {
    if (searchTourStep === 1) {
      return (
        <>
          <p className="text-sm sm:text-base font-semibold mb-1.5">
            Step 1: Enter class code (unique code)
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-200/90">
            <li>
              Your instructor will send you a{" "}
              <span className="font-semibold">class code</span> like:
              <span className="font-mono ml-1 bg-slate-800/80 px-1.5 py-0.5 rounded">
                PHYS301#K3I17J
              </span>
            </li>
            <li>Copy & paste the entire code into this search box.</li>
            <li>You don&apos;t have to remember long course names or codes.</li>
          </ul>
        </>
      );
    }

    if (searchTourStep === 2) {
      return (
        <>
          <p className="text-sm sm:text-base font-semibold mb-1.5">
            Step 2: Check the course information
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-200/90">
            <li>
              The system will show the{" "}
              <span className="font-semibold">
                course name, class section, and instructor
              </span>{" "}
              for that code.
            </li>
            <li>
              Make sure it is the{" "}
              <span className="font-semibold">correct course</span> and{" "}
              <span className="font-semibold">instructor</span>.
            </li>
            <li>
              If it doesn&apos;t look right, double-check the code your
              instructor sent.
            </li>
          </ul>
        </>
      );
    }

    return (
      <>
        <p className="text-sm sm:text-base font-semibold mb-1.5">
          Step 3: Join the course
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-200/90">
          <li>
            When everything looks correct, click{" "}
            <span className="font-semibold">Join</span> to enroll.
          </li>
          <li>
            After joining, you&apos;ll see{" "}
            <span className="font-semibold">
              assignments, support requests, announcements, etc.
            </span>
          </li>
          <li>
            For every new class, just use the{" "}
            <span className="font-semibold">unique code</span> again.
          </li>
        </ul>
        <p className="mt-2 text-[11px] sm:text-xs text-slate-300/80">
          Any time later, you can come back to this search box to quickly join
          another course.
        </p>
      </>
    );
  };

  return (
    <>
      {/* 🔲 Overlay tối toàn màn hình (body) */}
      {showSearchTour && <div className="fixed inset-0 z-40 bg-black/70" />}

      <header
        className="fixed top-0 z-50 w-full h-16 backdrop-blur-sm"
        style={{
          background: showSearchTour
            ? "rgba(255,255,255,0.72)"
            : "rgba(255,255,255,0.72)",
          borderBottom: showSearchTour ? "none" : "1px solid var(--border)",
        }}
      >
        {/* Wrapper căn giữa header */}
        <div
          className="relative mx-auto flex h-full w-full items-center gap-6"
          style={{ paddingLeft: "2rem", paddingRight: "1rem" }}
        >
          {/* Overlay tối riêng cho header (logo/nav/bell/user) */}
          {showSearchTour && (
            <div className="pointer-events-auto absolute inset-0 z-60 bg-black/65" />
          )}

          {/* Logo + Nav + Search + Right actions */}
          {/* ❗ Không set z-index ở đây để overlay có thể phủ lên */}
          <div className="flex h-full w-full items-center gap-6">
            {/* Logo */}
            <div className="shrink-0">
              <Logo />
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8">
              {navs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="no-underline"
                  aria-current={item.isActive ? "page" : undefined}
                >
                  <span
                    className={`text-base font-medium leading-none transition-colors visited:text-nav ${
                      item.isActive
                        ? "text-nav-active"
                        : "text-nav hover:text-nav-active focus:text-nav-active active:text-nav-active"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* 🔍 Search + spotlight + tooltip */}
            {/* Search được tách ra với z cao để nổi lên trên mọi overlay */}
            <div className="relative ml-32 z-[70]">
              {/* Vòng spotlight quanh ô search */}
              {showSearchTour && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  className="pointer-events-none absolute -inset-2 z-[80] rounded-3xl ring-4 ring-indigo-400/90 shadow-[0_0_0_8px_rgba(129,140,248,0.5)]"
                />
              )}

              {/* Chính ô search */}
              <div className="relative z-[80]">
                <CourseCodeSearch />
              </div>

              {/* Tooltip hướng dẫn search */}
              <AnimatePresence>
                {showSearchTour && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 230, damping: 22 }}
                    // 🔥 rộng hơn: 360 / 440
                    className="absolute left-1/2 top-full mt-3 w-[360px] sm:w-[440px] -translate-x-1/2 rounded-2xl bg-slate-950 text-slate-50 shadow-2xl border border-slate-700/80 px-5 py-4 z-[80]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] sm:text-xs uppercase tracking-wide text-indigo-300 font-semibold">
                          Search Quick Tour · Step {searchTourStep}/3
                        </p>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-300/80">
                          A short guide to use the search box to join your
                          courses.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={finishSearchTour}
                        className="mt-0.5 text-[11px] text-slate-400 hover:text-slate-100 transition-colors"
                      >
                        Skip
                      </button>
                    </div>

                    {renderSearchTourText()}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                              searchTourStep === i
                                ? "w-5 bg-indigo-400"
                                : "w-3 bg-slate-600/80"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (searchTourStep < 3) {
                            setSearchTourStep(
                              (searchTourStep + 1) as 1 | 2 | 3
                            );
                          } else {
                            finishSearchTour();
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-400/70 bg-indigo-500/90 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow-md hover:bg-indigo-400 hover:border-indigo-300 transition-colors"
                      >
                        {searchTourStep < 3 ? "Next" : "Done"}
                        <span className="text-[10px]">↵</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Notifications + User menu (nằm dưới overlay header) */}
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 mr-3 rounded-lg shadow-sm">
                <NotificationsMenu
                  open={notificationOpen}
                  onOpenChange={handleNotificationOpenChange}
                  badgeCount={unreadCount}
                  notifications={notifications}
                  connected={connected}
                  connecting={connecting}
                  lastError={lastError ?? undefined}
                />
              </div>

              <div className="flex items-center border-slate-100 bg-slate-100 rounded-xl shadow-lg">
                <UserMenu
                  open={dropdownOpen}
                  onOpenChange={(v) => {
                    setDropdownOpen(v);
                    if (v) setNotificationOpen(false);
                  }}
                  user={user ?? null}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
