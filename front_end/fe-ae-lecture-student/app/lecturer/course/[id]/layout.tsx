"use client";

import { usePathname } from "next/navigation";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Nếu là trang chỉnh sửa thì chỉ render children, không render layout
    if (pathname.endsWith("/course")) {
        return <>{children}</>;
    }

    // ...existing code...
    return (
        <div className="p-3 flex-1 min-h-0">
            {children}
        </div>
    );
}