"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Rocket,
  GraduationCap,
  Sparkles,
  BookOpen,
  Megaphone,
  Brain,
  PartyPopper,
} from "lucide-react";

export default function StudentHomePage() {
  return (
    // Side paddings
    <div className="relative min-h-[calc(100vh-80px)] px-4 md:px-8 lg:px-12 py-8">
      {/* Background: soft grid + brand green radials (use CSS vars) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(24rem 24rem at 20% 20%, color-mix(in oklab, var(--color-brand) 12%, transparent), transparent),
            radial-gradient(20rem 20rem at 80% 0%, color-mix(in oklab, var(--color-brand) 10%, transparent), transparent),
            var(--background)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10
        [background-image:linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
        [background-size:56px_56px]"
      />

      <div className="space-y-10">
        {/* Hero: glass with brand strip */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white/75 backdrop-blur-xl shadow-sm"
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background:
                "linear-gradient(90deg, var(--color-brand), var(--color-brand-700))",
            }}
          />
          <div className="flex flex-col md:flex-row items-center gap-8 p-8">
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  color: "var(--color-brand-700)",
                  background: "color-mix(in oklab, var(--color-brand) 12%, white)",
                  border: "1px solid color-mix(in oklab, var(--color-brand) 30%, white)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                AIDS-LMS • AI-Driven DataSync
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Intelligent Learning & Clean Data for{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, var(--color-brand-600), var(--color-brand-700))",
                  }}
                >
                  Digital Marketing
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Collect clean data, generate instant AI reports, and manage classes and
                group projects — all in one place, optimized for assignments and research.
              </p>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="shrink-0"
            >
              <div className="relative">
                <div
                  className="absolute -inset-4 -z-10 rounded-full blur-2xl"
                  style={{
                    background:
                      "linear-gradient(45deg, color-mix(in oklab, var(--color-brand) 28%, transparent), color-mix(in oklab, var(--color-brand-700) 20%, transparent))",
                  }}
                />
                <img
                  src="/home-student.png"
                  alt="Student learning illustration"
                  className="w-56 md:w-72 rounded-2xl border border-[var(--color-border)] shadow-sm"
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Notifications: timeline with Lucide icons (brand green) */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--color-border)] bg-white/80 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5" style={{ color: "var(--color-brand-600)" }} />
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">Latest Updates</h2>
          </div>

          <ol className="relative ms-3 border-s" style={{ borderColor: "var(--color-border)" }}>
            {[
              {
                icon: Megaphone,
                title: 'New AI report template added: "Omnichannel Analysis".',
                time: "2 hours ago",
              },
              {
                icon: Brain,
                title: 'Weekly Insights available for "Content Marketing Trends".',
                time: "1 day ago",
              },
              {
                icon: PartyPopper,
                title: "Welcome to Fall 2025 — kick off your new group projects!",
                time: "3 days ago",
              },
            ].map((n, idx) => {
              const Icon = n.icon;
              return (
                <li key={idx} className="relative ps-6 py-3">
                  <span
                    className="absolute -left-[11px] top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white border"
                    style={{ borderColor: "color-mix(in oklab, var(--color-brand) 35%, white)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "var(--color-brand-600)" }} />
                  </span>
                  <p className="text-sm text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                </li>
              );
            })}
          </ol>
        </motion.section>

        {/* Features: glass cards with green accents */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            {
              icon: Rocket,
              title: "AI-Powered Crawler",
              desc: "Collect and clean marketing data with admin-configured sources and rules.",
            },
            {
              icon: BookOpen,
              title: "AI Report Generator",
              desc: "Instant sentiment & keyword analysis to PDF/Word/Markdown using templates.",
            },
            {
              icon: GraduationCap,
              title: "Smart LMS",
              desc: "Classes, assignments, grading, groups, quota, and analytics — all-in-one.",
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="rounded-2xl border bg-white/70 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition"
                style={{
                  borderColor: "color-mix(in oklab, var(--color-brand) 25%, var(--color-border))",
                  backgroundImage:
                    "linear-gradient(to bottom, color-mix(in oklab, var(--color-brand) 10%, white), transparent)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="rounded-xl border bg-white/90 p-2"
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--color-brand-600) 28%, var(--color-border))",
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: "var(--color-brand-700)" }} />
                  </div>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                </div>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.section>
      </div>
    </div>
  );
}
