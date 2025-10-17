"use client";
import { createContext, useContext, useState } from "react";

type TabType = "students" | "groups" | "assignments";

interface CourseTabContextValue {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

const CourseTabContext = createContext<CourseTabContextValue | null>(null);

export function CourseTabProvider({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState<TabType>("students");
    return (
        <CourseTabContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </CourseTabContext.Provider>
    );
}

export function useCourseTab() {
    const ctx = useContext(CourseTabContext);
    if (!ctx) throw new Error("useCourseTab must be used within CourseTabProvider");
    return ctx;
}
