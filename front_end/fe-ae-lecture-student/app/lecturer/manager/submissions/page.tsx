"use client";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "../components/Breadcrumbs";

export default function SubmissionsPage() {
  return (
    <div className="p-3 space-y-3">
      <Breadcrumbs items={[{ label: "Manager", href: "/manager" }, { label: "Submissions" }]} />
      <Card className="p-4">Submissions UI placeholder (manage resubmits, grant extensions)</Card>
    </div>
  );
}
