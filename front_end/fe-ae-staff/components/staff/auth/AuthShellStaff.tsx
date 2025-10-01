"use client";
import { BRAND, CAPABILITIES, METRICS } from "@/config/branding";
import { motion } from "framer-motion";
import { Database, LifeBuoy, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellStaffProps {
  children: ReactNode;
  side?: ReactNode;
  centered?: boolean;
  hideFooter?: boolean;
}

// Auth shell visually distinct for Staff (teal / indigo accents instead of pure emerald)
export function AuthShellStaff({ children, side, centered = false, hideFooter = false }: AuthShellStaffProps){
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-indigo-100">
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Link href="/" className="flex items-center gap-2" aria-label={BRAND.productNameEn}>
          <Image src="/ai-enhance-logo.svg" alt={BRAND.productNameEn} width={30} height={30} />
          <span className="font-semibold tracking-tight text-slate-800 text-lg">{BRAND.shortName} Staff</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 text-[13px] text-slate-500">
          <span className="inline-flex items-center gap-1"><LifeBuoy size={14} /> Support Hub</span>
          <span className="inline-flex items-center gap-1"><Database size={14}/> Data Monitor</span>
        </div>
      </header>

      {centered ? (
        <main className="flex-1 w-full px-4 py-10 flex items-center justify-center">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45, ease:'easeOut' }} className="w-full max-w-lg">{children}</motion.div>
        </main>
      ) : (
        <main className="flex-1 w-full px-4 md:px-10 xl:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity:0, x:-28 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:.55, ease:"easeOut" }}
            className="hidden lg:flex col-span-6 xl:col-span-7 pr-2"
          >
            {side ?? (
              <div className="relative w-full flex flex-col justify-center">
                {/* Decorative gradient blobs for STAFF theme (sky/indigo) */}
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute top-10 left-16 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
                  <div className="absolute bottom-14 right-10 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
                </div>

                <div className="space-y-10">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-sky-300">Operations Team</span>
                    <h2 className="mt-5 text-4xl xl:text-5xl font-bold tracking-tight text-slate-800 leading-tight">
                      Staff <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Workspace</span>
                    </h2>
                    <p className="mt-5 text-slate-600 max-w-xl leading-relaxed text-[15px]">
                      Central hub for support, data quality assurance, crawler operations & quota oversight.
                    </p>
                  </div>

                  <ul className="grid grid-cols-2 gap-5 max-w-xl" aria-label="Staff capabilities">
                    {CAPABILITIES.slice(0,4).map((item,i)=>(
                      <li key={item.title} className="list-none">
                        <motion.div
                          initial={{ opacity:0, y:16 }}
                          animate={{ opacity:1, y:0 }}
                          transition={{ delay: .18 + i*0.08, duration:.45 }}
                          className="group relative rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
                        >
                          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40">
                            {i === 0 && <ShieldCheck size={18} />}
                            {i === 1 && <Users size={18} />}
                            {i === 2 && <LifeBuoy size={18} />}
                            {i === 3 && <Database size={18} />}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{item.desc}</p>
                          </div>
                        </motion.div>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-3 gap-4 max-w-md" aria-label="Operational highlights">
                    {METRICS.map((m,i)=>(
                      <motion.div
                        key={m.label}
                        initial={{ opacity:0, y:12 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ delay:.4 + i*0.05 }}
                        className="rounded-lg border border-sky-200 bg-gradient-to-br from-white/90 to-indigo-50/60 backdrop-blur p-4 text-center"
                      >
                        <div className="text-[10px] font-medium tracking-wide text-indigo-700 uppercase">{m.label}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{m.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

            <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex items-center">{children}</div>
        </main>
      )}

      {!hideFooter && (
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200">
          © {BRAND.year} {BRAND.footerCopyrightHolder}. Staff Console.
        </footer>
      )}
    </div>
  );
}
