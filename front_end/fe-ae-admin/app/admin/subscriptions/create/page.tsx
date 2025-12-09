"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { useCreateSubscriptionPlan } from "@/hooks/subscription/useCreateSubscriptionPlan";
import type { CreateSubscriptionPlanPayload } from "@/types/subscription/subscription.payload";
import { SubscriptionTier } from "@/types/subscription/subscription.response";

const initialForm: CreateSubscriptionPlanPayload = {
  name: "",
  description: "",
  price: 0,
  currency: "VND",
  durationDays: 30,
  quotaLimit: 0,
  features: [],
  isActive: true,
  tier: SubscriptionTier.Free,
};

const tierOptions = [
  { value: SubscriptionTier.Free, label: "Free" },
  { value: SubscriptionTier.Basic, label: "Basic" },
  { value: SubscriptionTier.Premium, label: "Premium" },
  { value: SubscriptionTier.Enterprise, label: "Enterprise" },
];

export default function CreateSubscriptionPlanPage() {
  const router = useRouter();
  const { loading, createSubscriptionPlan } = useCreateSubscriptionPlan();

  const [form, setForm] = useState<CreateSubscriptionPlanPayload>(initialForm);
  const [featuresInput, setFeaturesInput] = useState("");

  const handleChange =
    (field: keyof CreateSubscriptionPlanPayload) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        if (["price", "durationDays", "quotaLimit"].includes(field)) {
          setForm((prev) => ({
            ...prev,
            [field]: Number(value),
          }));
          return;
        }

        setForm((prev) => ({
          ...prev,
          [field]: value,
        }));
      };

  const handleTierChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tier: Number(value) as SubscriptionTier,
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const parseFeatures = () =>
    (featuresInput || "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CreateSubscriptionPlanPayload = {
        ...form,
        features: parseFeatures(),
      };

      const create = await createSubscriptionPlan(payload);
      if (create.status === 200 || create.status === 201) {
        router.push("/admin/subscriptions");
      } return;

    } catch (err) {
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setFeaturesInput("");
  };

  return (
    <div className="scrollbar-stable mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create Subscription Plan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define pricing, quota and features for a new subscription tier.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-brand/40 text-sm"
            onClick={() => router.push("/admin/subscriptions")}
          >
            Back to list
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        {/* Form card */}
        <Card className="card border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Plan details
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Fill in the information below to create a new plan. You can edit
              or deactivate it later.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  className="input"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Basic, Premium, Enterprise..."
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="input min-h-[80px]"
                  value={form.description}
                  onChange={handleChange("description")}
                  placeholder="Short description of this plan"
                  required
                />
              </div>

              {/* Price + Currency */}
              <div className="grid gap-4 sm:grid-cols-[1.4fr,0.8fr]">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-medium">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    className="input"
                    value={form.price}
                    onChange={handleChange("price")}
                  />
                  <p className="text-[11px] text-slate-500">
                    Set to 0 for free plans.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs font-medium">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    className="input"
                    value={form.currency}
                    onChange={handleChange("currency")}
                  />
                </div>
              </div>

              {/* Duration + Quota */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="durationDays" className="text-xs font-medium">
                    Duration (days)
                  </Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={0}
                    className="input"
                    value={form.durationDays}
                    onChange={handleChange("durationDays")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quotaLimit" className="text-xs font-medium">
                    Quota limit
                  </Label>
                  <Input
                    id="quotaLimit"
                    type="number"
                    min={0}
                    className="input"
                    value={form.quotaLimit}
                    onChange={handleChange("quotaLimit")}
                    placeholder="e.g. 100, 500..."
                  />
                </div>
              </div>

              {/* Tier + Active */}
              <div className="grid gap-4 sm:grid-cols-[1.4fr,0.8fr] sm:items-center">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Tier</Label>
                  <Select
                    value={String(form.tier)}
                    onValueChange={handleTierChange}
                  >
                    <SelectTrigger className="input h-10">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tierOptions.map((t) => (
                        <SelectItem key={t.value} value={String(t.value)}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">
                      Active
                    </p>
                    <p className="text-[11px] text-slate-500">
                      If disabled, users won&apos;t see this plan.
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={handleActiveChange}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label htmlFor="features" className="text-xs font-medium">
                  Features
                </Label>
                <Input
                  id="features"
                  className="input"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Basic crawling, Email support, API access..."
                />
                <p className="text-[11px] text-slate-500">
                  Separate features by commas. Example:{" "}
                  <span className="font-mono">
                    Basic crawling, Email support, API access
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs sm:text-sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="btn btn-gradient-slow px-4 py-2 text-xs sm:text-sm"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Side info card */}
        <Card className="card border border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Tips for designing plans
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Some quick guidelines to make your pricing clear and effective.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="space-y-1">
              <p className="font-medium text-slate-800">1. Clear naming</p>
              <p className="text-xs text-slate-500">
                Use simple names like{" "}
                <span className="font-semibold">Free</span>,{" "}
                <span className="font-semibold">Basic</span>,{" "}
                <span className="font-semibold">Premium</span> so users
                immediately understand the hierarchy.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-slate-800">2. Obvious value</p>
              <p className="text-xs text-slate-500">
                Highlight what each plan unlocks compared to the lower tier.
                Use the features field to describe key benefits.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-slate-800">3. Keep it consistent</p>
              <p className="text-xs text-slate-500">
                Duration and quota should make sense together. For example,
                short duration + small quota for trial plans, higher quota for
                enterprise.
              </p>
            </div>

            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              You can always edit or deactivate a plan later from the{" "}
              <span
                className="cursor-pointer text-brand hover:text-brand-600"
                onClick={() => router.push("/admin/subscriptions")}
              >
                plans list
              </span>
              .
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
