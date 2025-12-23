"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoogleLogin } from "@/hooks/auth/useGoogleLogin";
import { useLogin } from "@/hooks/auth/useLogin";
import { executeTurnstile, loadTurnstileScript, renderTurnstileWidget } from "@/lib/turnstile";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    grecaptcha?: any;
    turnstile?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const { login, loading } = useLogin();
  const { googleLogin, loading: googleAuthLoading } = useGoogleLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const gisReadyRef = useRef(false);

  // 1. XỬ LÝ ONE TAP KHI VÀO TRANG
  useEffect(() => {
    const SCRIPT_ID = "google-identity-services";
    const init = () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp: { credential?: string }) => {
            const credential = resp?.credential;
            if (!credential) return;
            await googleLogin({
              googleIdToken: credential,
              rememberMe,
              ipAddress: "",
              userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
            });
          },
          auto_select: false,
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
        });
        gisReadyRef.current = true;

        // Tự động hiện One Tap khi load xong script
        window.google.accounts.id.prompt((notification: any) => {
          // Xử lý sự kiện hiển thị/tắt nếu cần
        });

      } catch (e) {
        console.error("[auth] init google id error:", e);
      }
    };

    const existed = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existed) {
      if (window.google?.accounts?.id) init();
      return;
    }

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = init;
    document.head.appendChild(s);
  }, [googleLogin, rememberMe]);

  // 2. XỬ LÝ KHI GOOGLE REDIRECT VỀ (Sau khi chọn tài khoản)
  useEffect(() => {
    // Google sẽ trả về token trên URL dạng: /login#id_token=...&...
    const hash = window.location.hash;
    if (hash && hash.includes("id_token")) {
      const params = new URLSearchParams(hash.substring(1)); // Bỏ dấu #
      const token = params.get("id_token");

      if (token) {
        // Xóa hash trên URL để nhìn sạch sẽ hơn
        window.history.replaceState(null, "", window.location.pathname);

        // Gọi API login
        googleLogin({
          googleIdToken: token,
          rememberMe, // Lưu ý: giá trị này có thể là default vì trang đã reload
          ipAddress: "",
          userAgent: navigator.userAgent,
        });
      }
    }
  }, [googleLogin, rememberMe]);

  // Load Turnstile (Giữ nguyên)
  useEffect(() => {
    const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!SITE_KEY) return;
    loadTurnstileScript();
  }, []);

  const turnstileWidgetIdRef = useRef<number | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);

  // Render Turnstile (Giữ nguyên)
  useEffect(() => {
    // ... (Code cũ của bạn giữ nguyên)
    const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!SITE_KEY) return;
    const tryRender = () => {
      try {
        if (!turnstileContainerRef.current) return;
        if (turnstileWidgetIdRef.current !== null) return;
        const id = renderTurnstileWidget(turnstileContainerRef.current, SITE_KEY, (token: string) => {
          if (turnstileContainerRef.current) turnstileContainerRef.current.dataset.token = token;
        });
        if (id !== null) turnstileWidgetIdRef.current = id;
      } catch (e) { }
    };
    tryRender();
    const handler = () => tryRender();
    window.addEventListener("turnstile:load", handler as EventListener);
    return () => window.removeEventListener("turnstile:load", handler as EventListener);
  }, []);


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (SITE_KEY && turnstileWidgetIdRef.current !== null) {
      try {
        const token = await executeTurnstile(turnstileWidgetIdRef.current, turnstileContainerRef.current);
        if (token) {
          await login({ email: email.trim(), password: password.trim(), rememberMe, captchaToken: token });
          return;
        }
      } catch (e) { }
    }
    await login({ email: email.trim(), password: password.trim(), rememberMe });
  };

  // CHUYỂN HƯỚNG SANG TRANG CHỌN ACCOUNT
  const handleGoogleLogin = () => {
    const redirectUri = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";

    // Tạo URL đăng nhập OAuth2
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: redirectUri,
      client_id: GOOGLE_CLIENT_ID || "",
      access_type: "online",
      response_type: "id_token", // Yêu cầu trả về ID Token (JWT) giống như One Tap
      prompt: "select_account",  // QUAN TRỌNG: Ép buộc hiển thị màn hình chọn tài khoản
      scope: "openid email profile",
      nonce: "nonce_" + new Date().getTime(), // Random string để bảo mật
    };

    const qs = new URLSearchParams(options).toString();

    // Chuyển hướng người dùng
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <AuthShell
      title="Welcome back!"
      subtitle={
        <span>
          New here?{" "}
          <a className="underline hover:text-violet-700" href="/register" rel="nofollow">
            Create an account
          </a>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          placeholder="example@crawldata.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          placeholder="•••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mb-6 flex items-center justify-between text-sm text-slate-600">
          <label className="inline-flex select-none items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-slate-300 bg-white"
            />
            Remember me
          </label>
          <a href="/forgot-password" className="underline" rel="nofollow">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="btn btn-gradient w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="relative my-4">
          <div className="border-t border-slate-200" />
          <span className="bg-[--card] absolute -top-2 left-1/2 -translate-x-1/2 px-2 text-[11px] tracking-wide text-slate-500">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full border border-slate-200 hover:border-slate-300"
          onClick={handleGoogleLogin}
          disabled={googleAuthLoading} // Đổi loading state
          aria-label="Đăng nhập với Google"
        >
          {/* Nếu đang loading do redirect về thì hiện text loading, hoặc giữ nguyên logo */}
          {googleAuthLoading ? "Verifying..." : <img src="/gg-logo2.webp" alt="Google" className="w-10 h-10" />}
        </Button>

        <div id="g-btn-container" className="hidden" />
        <div ref={turnstileContainerRef} className="hidden" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-xs text-slate-500"
        >
          By continuing, you agree to our{" "}
          <a href="#" className="text-green-600" rel="nofollow">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-green-600" rel="nofollow">
            Privacy Policy
          </a>
          .
        </motion.div>
      </form>
    </AuthShell>
  );
}