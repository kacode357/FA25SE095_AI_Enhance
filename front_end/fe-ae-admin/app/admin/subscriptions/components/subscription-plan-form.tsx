// app/admin/subscriptions/components/subscription-plan-form.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useUpdateSubscriptionPlan } from "@/hooks/subscription/useUpdateSubscriptionPlan";
import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import type {
  SubscriptionPlan,
} from "@/types/subscription/subscription.response";
import type { UpdateSubscriptionPlanPayload } from "@/types/subscription/subscription.payload";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type Props = {
  editingPlan: SubscriptionPlan | null;
  onSaved: () => void;
  onClearSelection: () => void;
};

type LocalFormState = {
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  quotaLimit: number;
  features: string[];
  isActive: boolean;
};

const emptyLocalForm: LocalFormState | null = null;

export function SubscriptionPlanForm({
  editingPlan,
  onSaved,
  onClearSelection,
}: Props) {
  const { loading, updateSubscriptionPlan } = useUpdateSubscriptionPlan();
  const { loading: tiersLoading, tiers, fetchSubscriptionTiers } =
    useSubscriptionTiers();

  const [form, setForm] = useState<LocalFormState | null>(emptyLocalForm);
  const [featuresInput, setFeaturesInput] = useState("");

  useEffect(() => {
    fetchSubscriptionTiers({ isActive: true });
  }, [fetchSubscriptionTiers]);

  useEffect(() => {
    if (!editingPlan) {
      setForm(emptyLocalForm);
      setFeaturesInput("");
      return;
    }

    setForm({
      name: editingPlan.name,
      description: editingPlan.description,
      price: editingPlan.price,
      currency: editingPlan.currency,
      durationDays: editingPlan.durationDays,
      quotaLimit: editingPlan.quotaLimit,
      features: editingPlan.features ?? [],
      isActive: editingPlan.isActive,
    });

    setFeaturesInput((editingPlan.features ?? []).join(", "));
  }, [editingPlan]);

  const tierLabel = useMemo(() => {
    if (!editingPlan) return "";

    const match = tiers.find(
      (tier) => tier.id === editingPlan.subscriptionTierId
    );
    if (match) {
      return Number.isFinite(match.level)
        ? `${match.name} (L${match.level})`
        : match.name;
    }
    if (editingPlan.subscriptionTierName) {
      return Number.isFinite(editingPlan.subscriptionTierLevel)
        ? `${editingPlan.subscriptionTierName} (L${editingPlan.subscriptionTierLevel})`
        : editingPlan.subscriptionTierName;
    }
    if (tiersLoading) return "Loading tiers...";
    return editingPlan.subscriptionTierId;
  }, [editingPlan, tiers, tiersLoading]);

  if (!editingPlan || !form) {
    return (
      <Card className="card border border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Edit subscription plan
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Select a plan from the list to edit its details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            Choose a plan on the left and click{" "}
            <span className="font-semibold">Edit</span> to start editing.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleChange =
    (field: keyof LocalFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;

      if (["price", "durationDays", "quotaLimit"].includes(field)) {
        setForm((prev) =>
          prev
            ? {
                ...prev,
                [field]: Number(value),
              }
            : prev
        );
        return;
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              [field]: value,
            }
          : prev
      );
    };

  const handleActiveChange = (checked: boolean) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            isActive: checked,
          }
        : prev
    );
  };

  const parseFeatures = () =>
    (featuresInput || "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !form) return;

    try {
      const payload: UpdateSubscriptionPlanPayload = {
        name: form.name,
        description: form.description,
        price: form.price,
        currency: form.currency,
        durationDays: form.durationDays,
        quotaLimit: form.quotaLimit,
        features: parseFeatures(),
        isActive: form.isActive,
      };

      await updateSubscriptionPlan(editingPlan.id, payload);
      onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (!editingPlan) return;
    setForm({
      name: editingPlan.name,
      description: editingPlan.description,
      price: editingPlan.price,
      currency: editingPlan.currency,
      durationDays: editingPlan.durationDays,
      quotaLimit: editingPlan.quotaLimit,
      features: editingPlan.features ?? [],
      isActive: editingPlan.isActive,
    });
    setFeaturesInput((editingPlan.features ?? []).join(", "));
  };

  return (
    <Card className="card border border-[var(--border)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">
              Edit: {editingPlan.name}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Update plan details and availability.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 text-[11px] text-slate-500 hover:text-slate-700"
            onClick={onClearSelection}
          >
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-xs font-medium">
              Name
            </Label>
            <Input
              id="edit-name"
              className="input"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              className="input min-h-[70px]"
              value={form.description}
              onChange={handleChange("description")}
              required
            />
          </div>

          {/* Price + Duration */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-price" className="text-xs font-medium">
                Price
              </Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                className="input"
                value={form.price}
                onChange={handleChange("price")}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-durationDays"
                className="text-xs font-medium"
              >
                Duration (days)
              </Label>
              <Input
                id="edit-durationDays"
                type="number"
                min={0}
                className="input"
                value={form.durationDays}
                onChange={handleChange("durationDays")}
              />
            </div>
          </div>

          {/* Currency + Quota */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-currency" className="text-xs font-medium">
                Currency
              </Label>
              <Input
                id="edit-currency"
                className="input"
                value={form.currency}
                onChange={handleChange("currency")}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-quotaLimit"
                className="text-xs font-medium"
              >
                Quota limit
              </Label>
              <Input
                id="edit-quotaLimit"
                type="number"
                min={0}
                className="input"
                value={form.quotaLimit}
                onChange={handleChange("quotaLimit")}
              />
            </div>
          </div>

          {/* Tier + Active */}
          <div className="grid gap-3 sm:grid-cols-[1.4fr,1fr] sm:items-center">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Tier</Label>
              <Input
                value={tierLabel}
                className="input h-9 bg-slate-50"
                readOnly
              />
              <p className="text-[11px] text-slate-500">
                Tier changes are managed in subscription tiers.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-slate-50 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-700">Active</p>
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
            <Label htmlFor="edit-features" className="text-xs font-medium">
              Features
            </Label>
            <Input
              id="edit-features"
              className="input"
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Basic crawling, Email support, API access..."
            />
            <p className="text-[11px] text-slate-500">
              Separate features by commas.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-[var(--border)] text-xs"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="btn btn-gradient-slow text-xs"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
