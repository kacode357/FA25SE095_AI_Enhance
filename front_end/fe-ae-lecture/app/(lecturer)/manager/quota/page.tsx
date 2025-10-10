"use client";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "../components/Breadcrumbs";

export default function QuotaPage() {
  return (
    <div className="p-3 space-y-3">
      <Breadcrumbs items={[{ label: "Manager", href: "/manager" }, { label: "Quota" }]} />
      <Card className="p-4">Quota UI placeholder (view usage, request more quota)</Card>
    </div>
  );
}
