"use client";

import { Users, GraduationCap, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  // Mock data cho thống kê
  const stats = [
    {
      label: "Total Students",
      value: "2,543",
      change: "+12% from last month",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "up",
    },
    {
      label: "Total Lecturers",
      value: "128",
      change: "+4% from last month",
      icon: GraduationCap,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      trend: "up",
    },
    {
      label: "Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      trend: "up",
    },
    {
      label: "Active Now",
      value: "573",
      change: "-2% since last hour",
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-100",
      trend: "down",
    },
  ];

  // Mock data cho danh sách mới
  const recentUsers = [
    {
      name: "Nguyen Van A",
      email: "nguyenvana@gmail.com",
      role: "Student",
      status: "Active",
      date: "2 mins ago",
    },
    {
      name: "Le Thi B",
      email: "lethib@university.edu.vn",
      role: "Lecturer",
      status: "Pending",
      date: "15 mins ago",
    },
    {
      name: "Tran Van C",
      email: "tranvanc@gmail.com",
      role: "Student",
      status: "Active",
      date: "1 hour ago",
    },
    {
      name: "Pham Thi D",
      email: "phamthid@gmail.com",
      role: "Student",
      status: "Inactive",
      date: "3 hours ago",
    },
    {
      name: "Hoang Van E",
      email: "hoangve@tech.com",
      role: "Staff",
      status: "Active",
      date: "5 hours ago",
    },
  ];

  return (
    <motion.div
      className="space-y-6 p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard Overview
        </h1>
        <div className="text-sm text-slate-500">
          Last updated: Today at 09:00 AM
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>
              </div>
              <div className={`rounded-full p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {stat.trend === "up" ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
              )}
              <span
                className={
                  stat.trend === "up" ? "text-emerald-600" : "text-rose-600"
                }
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm md:col-span-4 lg:col-span-5">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-slate-900">Recent Registrations</h3>
          </div>
          <div className="p-0">
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.map((user, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            user.role === "Lecturer"
                              ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                              : user.role === "Student"
                              ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                              : "bg-slate-50 text-slate-600 ring-slate-500/10"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.status === "Active"
                              ? "text-emerald-700 bg-emerald-50"
                              : user.status === "Pending"
                              ? "text-amber-700 bg-amber-50"
                              : "text-slate-600 bg-slate-100"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500">
                        {user.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel (Quick Actions / Notifications) */}
        <div className="flex flex-col gap-4 md:col-span-3 lg:col-span-2">
           {/* Quick Actions */}
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">Quick Actions</h3>
            <div className="space-y-2">
                <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Create Announcement
                </button>
                <button className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Approve Lecturers
                </button>
                 <button className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Export Data
                </button>
            </div>
          </div>
          
           {/* System Status Mock */}
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
             <h3 className="mb-4 font-semibold text-slate-900">System Health</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Server Uptime</span>
                    <span className="text-emerald-600 font-medium">99.9%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Database Load</span>
                    <span className="text-blue-600 font-medium">34%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}