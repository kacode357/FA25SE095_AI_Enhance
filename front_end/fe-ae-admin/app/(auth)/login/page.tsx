// app/(auth)/login/page.tsx
"use client";

import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/auth/useLogin";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import Logo from "@/components/logo/Logo";

export default function LoginPage() {
  const { login, loading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await login({
      email: email.trim(),
      password: password.trim(),
      rememberMe,
    });
  };

  return (
    <div
      className="
        min-h-screen w-full
        flex items-center justify-center
        bg-gradient-to-br from-[#ffe9cf] via-[#fdf0ff] to-[#e6d5ff]
        px-4
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="
          w-full max-w-xl
          rounded-3xl bg-white
          shadow-[0_24px_60px_rgba(15,23,42,0.18)]
          border border-white/60
          px-10 py-8
        "
      >
        {/* Logo + title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome to <span className="text-purple-600">AIDS-LMS!</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Admin portal · Sign in to continue.
            </p>
          </div>

          {/* Logo component, không dùng <img src={Logo} /> */}
          <div className="scale-75 origin-top-right">
            <Logo
              href="/"
              imgSrc="/aids-logo.png"
              imgAlt="AIDS-LMS"
              className=""
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            placeholder="admin@crawldata.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="light"
          />

          <Input
            label="Password"
            placeholder="••••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="light"
          />

          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <label className="inline-flex select-none cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border border-slate-300 bg-white !cursor-pointer"
              />
              Remember me
            </label>

         
          </div>

          <button
            type="submit"
            className="btn btn-gradient w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-purple-500" rel="nofollow">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-purple-500" rel="nofollow">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </motion.div>
    </div>
  );
}
