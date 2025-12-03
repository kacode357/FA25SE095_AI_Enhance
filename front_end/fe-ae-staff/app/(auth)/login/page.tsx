// app/(auth)/login/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/auth/useLogin";
import { executeTurnstile, loadTurnstileScript, renderTurnstileWidget } from "@/lib/turnstile";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: any;
  }
}

export default function LoginPage() {
  const { login, loading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Load Turnstile script (if configured) using helper
  useEffect(() => {
    const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!SITE_KEY) return;
    loadTurnstileScript();
  }, []);

  const turnstileWidgetIdRef = useRef<number | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);

  // Try render widget into hidden container when turnstile becomes available
  useEffect(() => {
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
      } catch (e) {
        // ignore
      }
    };

    tryRender();
    const handler = () => tryRender();
    window.addEventListener("turnstile:load", handler as EventListener);
    return () => window.removeEventListener("turnstile:load", handler as EventListener);
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (SITE_KEY) {
      try {
        const token = await executeTurnstile(turnstileWidgetIdRef.current, turnstileContainerRef.current);
        if (token) {
          await login({ email: email.trim(), password: password.trim(), rememberMe, captchaToken: token });
          return;
        }
      } catch (err) {
        console.error("Turnstile error:", err);
      }
    }

    // fallback
    await login({ email: email.trim(), password: password.trim(), rememberMe });
  };

  return (
    <AuthShell
      title="Welcome back!"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Small panel label for staff login (centered) */}
        <div className="w-full text-center mb-7">
          <span className="inline-block text-sm font-semibold text-purple-700 uppercase tracking-wide drop-shadow-lg">
            STAFF PANEL
          </span>
        </div>
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

        {/* Hidden container for Cloudflare Turnstile invisible widget */}
        <div ref={turnstileContainerRef} className="hidden" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-xs mt-3 text-slate-500"
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