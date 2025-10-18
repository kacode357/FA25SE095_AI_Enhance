"use client";

import { motion } from "framer-motion";
import { BookOpen, Bell, Rocket, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentHomePage() {
  return (
    <div className="flex flex-col gap-10 py-6">
      {/* 👋 Welcome Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between"
      >
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-purple-600 w-7 h-7" />
            Welcome to <span className="text-blue-600">AI Enhance</span> 🎓
          </h1>
          <p className="mt-3 text-gray-600 max-w-lg">
            This is your personal student portal — manage your courses, track
            progress, receive updates, and enhance your learning journey with
            AI-powered tools.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5">
                <BookOpen className="w-4 h-4 mr-2" />
                View My Courses
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="border-blue-500 text-blue-600">
                <GraduationCap className="w-4 h-4 mr-2" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 md:mt-0 md:ml-10"
        >
          <img
            src="/home-student.png"
            alt="Student learning illustration"
            className="w-64 md:w-80"
          />
        </motion.div>
      </motion.section>

      {/* 🔔 Notifications Preview */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-slate-800">Latest Updates</h2>
        </div>

        <ul className="space-y-3">
          <li className="p-3 rounded-lg hover:bg-slate-50 transition flex items-start gap-3">
            <span className="mt-0.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            <div>
              <p className="text-sm text-gray-800">
                📢 New course materials have been uploaded for{" "}
                <b>“Advanced React & Next.js”</b>.
              </p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </li>
          <li className="p-3 rounded-lg hover:bg-slate-50 transition flex items-start gap-3">
            <span className="mt-0.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            <div>
              <p className="text-sm text-gray-800">
                🧠 Midterm results for <b>“Database Design & SQL”</b> are now available.
              </p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
          </li>
          <li className="p-3 rounded-lg hover:bg-slate-50 transition flex items-start gap-3">
            <span className="mt-0.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            <div>
              <p className="text-sm text-gray-800">
                🎉 Welcome to the Fall 2025 term! Check out your new courses and assignments.
              </p>
              <p className="text-xs text-gray-500 mt-1">3 days ago</p>
            </div>
          </li>
        </ul>
      </motion.section>

      {/* 🚀 Features */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {[
          {
            icon: <Rocket className="w-6 h-6 text-purple-600" />,
            title: "AI-Powered Learning",
            desc: "Get smarter study recommendations and personalized feedback powered by AI.",
          },
          {
            icon: <BookOpen className="w-6 h-6 text-blue-600" />,
            title: "Smart Course Management",
            desc: "Track your progress, deadlines, and grades all in one place.",
          },
          {
            icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
            title: "Empower Your Future",
            desc: "Learn effectively, stay updated, and reach your academic goals.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">{f.icon}<h3 className="font-semibold text-lg text-slate-800">{f.title}</h3></div>
            <p className="text-sm text-slate-600">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
