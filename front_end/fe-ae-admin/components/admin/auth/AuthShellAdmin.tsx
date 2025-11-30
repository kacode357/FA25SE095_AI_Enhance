// components/admin/auth/AuthShellAdmin.tsx
"use client";
import { BRAND, CAPABILITIES } from "@/config/branding";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellAdminProps {
  children: ReactNode;
  side?: ReactNode;
  centered?: boolean;
  hideFooter?: boolean;
}

export function AuthShellAdmin({
  children,
  side,
  centered = false,
  hideFooter = false,
}: AuthShellAdminProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/70 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={BRAND.productNameEn}
        >
          <Image
            src="/short-logo-aids.png"
            alt={BRAND.productNameEn}
            width={30}
            height={30}
          />
          <span className="font-semibold tracking-tight text-slate-800 text-lg">
            {BRAND.shortName} Admin
          </span>
        </Link>
      </header>

      {/* Main */}
      {centered ? (
        <main className="flex-1 w-full px-4 py-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            {children}
          </motion.div>
        </main>
      ) : (
        <main
          className={`
            flex-1 w-full
            px-4 md:px-8
            py-8 md:py-10
          `}
        >
          {/* dùng container để giới hạn chiều ngang, và min-h để cân giữa header/footer */}
          <div
            className="
              container mx-auto max-w-6xl
              grid grid-cols-1 lg:grid-cols-12
              gap-8 lg:gap-10
              items-center
              min-h-[calc(100vh-7rem)]
            "
          >
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="hidden lg:flex col-span-7"
            >
              {side ?? (
                <div className="relative w-full">
                  {/* decorative blobs nhỏ hơn để đỡ chói và đỡ chiếm diện tích */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute top-8 left-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
                    <div className="absolute bottom-10 right-8 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl" />
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-800 leading-snug">
                        {BRAND.productNameEn.split(" for ")[0]}{" "}
                        <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                          Platform
                        </span>
                      </h2>
                      <p className="mt-4 text-slate-600 max-w-xl leading-relaxed text-sm">
                        {BRAND.missionEn}
                      </p>
                    </div>

                    <ul
                      className="grid grid-cols-2 gap-4 max-w-xl"
                      aria-label="Platform capabilities"
                    >
                      {CAPABILITIES.map((item, i) => (
                        <li key={item.title} className="list-none">
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.12 + i * 0.06,
                              duration: 0.35,
                            }}
                            className="group relative rounded-xl border border-slate-200 bg-white/75 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
                          >
                            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40">
                              {i === 0 && <ShieldCheck size={16} />}
                              {i === 1 && <Users size={16} />}
                              {i === 2 && <Activity size={16} />}
                              {i === 3 && <Zap size={16} />}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">
                                {item.title}
                              </p>
                              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                                {item.desc}
                              </p>
                            </div>
                          </motion.div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT (form) */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="col-span-12 lg:col-span-5 w-full"
            >
              {/* Giới hạn chiều ngang + canh giữa để không bị thừa chỗ */}
              <div className="w-full max-w-md mx-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </main>
      )}

      {/* Footer */}
      {!hideFooter && (
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200">
          © {BRAND.year} {BRAND.footerCopyrightHolder}. All rights reserved.
        </footer>
      )}
    </div>
  );
}
