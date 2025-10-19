"use client";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "../components/Breadcrumbs";

export default function ProgressPage() {
  return (
    <div className="p-3 space-y-3">
      <Breadcrumbs items={[{ label: "Manager", href: "/manager" }, { label: "Progress" }]} />
      <Card className="p-4">Progress monitoring UI placeholder (group activity, logs, edit history)</Card>
    </div>
  );
}
