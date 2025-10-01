import { BarChart3, BookOpen, Eye, FolderCog, Gauge, LifeBuoy, ServerCog } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

const nav = [
  { href: '/staff/support/users', label: 'User Support', icon: LifeBuoy },
  { href: '/staff/classes', label: 'Class Support', icon: BookOpen },
  { href: '/staff/crawler', label: 'Crawler Ops', icon: ServerCog },
  { href: '/staff/inspection', label: 'Data Review', icon: Eye },
  { href: '/staff/quota', label: 'Quota', icon: Gauge },
  { href: '/staff/content', label: 'Support Content', icon: FolderCog },
  { href: '/staff/reports', label: 'Reports', icon: BarChart3 },
];

export default function StaffRootLayout({ children }: { children: ReactNode }){
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden md:flex w-60 flex-col border-r border-slate-200 bg-white/80 backdrop-blur">
        <div className="h-16 flex items-center px-4 font-semibold tracking-tight text-slate-800">Staff Console</div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
          {nav.map(item=>{
            const Icon = item.icon; return (
              <Link key={item.href} href={item.href} className="group flex items-center gap-2 rounded-md px-3 py-2 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors">
                <Icon size={16} className="text-slate-400 group-hover:text-sky-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 text-[10px] text-slate-400">© 2025 Staff Ops</div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white/70 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-10">
          <span className="text-[13px] text-slate-500">Operational Workspace</span>
          <div className="flex items-center gap-3 text-xs">
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 hover:bg-sky-50">Theme</button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-[11px] font-medium">ST</div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
