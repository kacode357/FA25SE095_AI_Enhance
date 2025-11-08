// app/(auth)/login/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/auth/useLogin";
import { useGoogleLogin } from "@/hooks/auth/useGoogleLogin"; 
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID);
export default function LoginPage() {
  const { login, loading } = useLogin();
  const { googleLogin, loading: googleAuthLoading } = useGoogleLogin(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const gisReadyRef = useRef(false);

  // Load GIS script 1 lần và initialize callback -> nhận ID token
  useEffect(() => {
    const SCRIPT_ID = "google-identity-services";
    const init = () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          // callback nhận ID token -> call BE google-login
          callback: async (resp: { credential?: string }) => {
            const credential = resp?.credential;
            if (!credential) return;

            await googleLogin({
              googleIdToken: credential,
              rememberMe,
              ipAddress: "", // optional
              userAgent:
                typeof navigator !== "undefined" ? navigator.userAgent : "",
            });
          },
          auto_select: false,
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
        });
        gisReadyRef.current = true;
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login({ email: email.trim(), password: password.trim(), rememberMe });
  };

  // Nhấn nút Google -> bật One Tap/Popup của GIS, callback ở trên sẽ xử lý
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      if (!gisReadyRef.current || !window.google?.accounts?.id) {
        throw new Error("Google SDK not ready");
      }
      // Hiển thị One Tap / popup. Khi user chọn account, callback sẽ bắn về.
      await new Promise<void>((resolve) => {
        window.google.accounts.id.prompt((notification: any) => {
          // Nếu không hiển thị được One Tap (bị chặn), vẫn resolve để tắt loading
          // Callback sign-in thành công vẫn chạy riêng (không qua nhánh này)
          resolve();
        });
      });
    } catch (e) {
      console.error("[auth] google prompt error:", e);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back!"
      subtitle={
        <span>
          New here?{" "}
          <a className="underline" href="/register" rel="nofollow">
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
          aria-busy={loading}
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
          loading={googleLoading || googleAuthLoading}
          aria-label="Đăng nhập với Google"
        >
          <Chrome size={18} />
          Đăng nhập với Google
        </Button>

        {/* Container ẩn nếu sau này muốn render Google button gốc (không bắt buộc) */}
        <div id="g-btn-container" className="hidden" />

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
