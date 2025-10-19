"use client";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "../components/Breadcrumbs";

export default function ReviewPage() {
  return (
    <div className="p-3 space-y-3">
      <Breadcrumbs items={[{ label: "Manager", href: "/manager" }, { label: "Data Review" }]} />
      <Card className="p-4">Data review UI placeholder (approve/reject data before analysis)</Card>
    </div>
  );
}
