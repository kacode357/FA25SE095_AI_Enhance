// app/student/components/AllCoursesTour.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const STORAGE_KEY = "student:all-courses:tour:v1";

export default function AllCoursesTour() {
  const [run, setRun] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    setIsDesktop(width >= 1024);

    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen && width >= 1024) {
      setRun(true);
    }

    setIsReady(true);
  }, []);

  const steps: Step[] = useMemo(
    () => [
      {
        target: '[data-tour="header-main-nav"]',
        content:
          "This is the main navigation. Use it to move between your dashboard, courses, and other areas.",
        disableBeacon: true,
        placement: "bottom",
      },
      {
        target: '[data-tour="header-actions"]',
        content:
          "Here you can search by course code, see notifications, and open your profile menu.",
        placement: "bottom",
      },
      {
        target: '[data-tour="allcourses-sidebar-filters"]',
        content:
          "Use these filters to narrow down courses by code, lecturer, or term.",
        placement: "right",
      },
      {
        target: '[data-tour="allcourses-results-header"]',
        content:
          "This header shows how many courses match your filters and lets you sort the list.",
        placement: "bottom",
      },
      {
        target: '[data-tour="allcourses-course-list"]',
        content:
          "Here is the list of available courses. You can join a course or go directly to its details.",
        placement: "top",
      },
    ],
    []
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    // Kết thúc hoặc skip tour
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "1");
      }
    }
  };

  if (!isReady || !isDesktop) return null;

  return (
  <Joyride
    steps={steps}
    run={run}
    callback={handleJoyrideCallback}
    continuous
    showSkipButton
    showProgress
    scrollToFirstStep
    styles={{
      options: {
        zIndex: 9999,
        primaryColor: "var(--brand)", // màu icon/indicator
      },
    }}
  />
);
}
