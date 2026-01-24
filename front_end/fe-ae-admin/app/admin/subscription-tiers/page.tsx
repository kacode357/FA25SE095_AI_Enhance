"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import { useCreateSubscriptionTier } from "@/hooks/subscription/useCreateSubscriptionTier";
import { useUpdateSubscriptionTier } from "@/hooks/subscription/useUpdateSubscriptionTier";
import { useDeleteSubscriptionTier } from "@/hooks/subscription/useDeleteSubscriptionTier";

import type {
  CreateSubscriptionTierPayload,
  UpdateSubscriptionTierPayload,
} from "@/types/subscription/subscription-tier.payload";
import type { SubscriptionTierItem } from "@/types/subscription/subscription-tier.response";

const emptyForm: CreateSubscriptionTierPayload = {
  name: "",
  description: "",
  level: 1,
  isActive: true,
};

export default function SubscriptionTiersPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    true
  );
  const [form, setForm] = useState<CreateSubscriptionTierPayload>(emptyForm);
  const [editingTier, setEditingTier] = useState<SubscriptionTierItem | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] =
    useState<SubscriptionTierItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { loading, tiers, fetchSubscriptionTiers } = useSubscriptionTiers();
  const { loading: creating, createSubscriptionTier } =
    useCreateSubscriptionTier();
  const { loading: updating, updateSubscriptionTier } =
    useUpdateSubscriptionTier();
  const { loading: deleting, deleteSubscriptionTier } =
    useDeleteSubscriptionTier();

  const isSaving = creating || updating;

  useEffect(() => {
    fetchSubscriptionTiers({ isActive: isActiveFilter });
  }, [fetchSubscriptionTiers, isActiveFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTier(null);
  };

  const handleEdit = (tier: SubscriptionTierItem) => {
    setEditingTier(tier);
    setForm({
      name: tier.name,
      description: tier.description,
      level: tier.level,
      isActive: tier.isActive,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubscriptionTier(deleteTarget.id);
      if (editingTier?.id === deleteTarget.id) resetForm();
      await fetchSubscriptionTiers({ isActive: isActiveFilter });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleChange =
    (field: keyof CreateSubscriptionTierPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (field === "level") {
        setForm((prev) => ({
          ...prev,
          level: Number(value),
        }));
        return;
      }
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTier) {
        const payload: UpdateSubscriptionTierPayload = {
          name: form.name,
          description: form.description,
          level: form.level,
          isActive: form.isActive,
        };
        await updateSubscriptionTier(editingTier.id, payload);
      } else {
        await createSubscriptionTier(form);
      }

      await fetchSubscriptionTiers({ isActive: isActiveFilter });
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="scrollbar-stable mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:py-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Subscription Tiers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage tiers used to group subscription plans and billing.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActiveFilter === true}
            onChange={(e) =>
              setIsActiveFilter(e.target.checked ? true : false)
            }
          />
          <span>Show only active tiers</span>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Card className="card border border-[var(--border)] shadow-sm overflow-hidden rounded-2xl py-0">
          <CardContent className="p-0">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                    Tier
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                    Level
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 text-right text-xs font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && tiers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-xs text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && tiers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-xs text-slate-500"
                    >
                      No tiers yet.
                    </td>
                  </tr>
                )}

                {tiers.map((tier) => (
                  <tr
                    key={tier.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-3 sm:px-4 py-3 align-top">
                      <div className="font-medium text-slate-900">
                        {tier.name}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2">
                        {tier.description}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top text-xs text-slate-700">
                      {tier.level}
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                          tier.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tier.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top text-right">
                      <div className="flex justify-end gap-1.5 sm:gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="btn-table"
                          onClick={() => handleEdit(tier)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="btn-table btn-table-danger"
                          onClick={() => {
                            setDeleteTarget(tier);
                            setDeleteOpen(true);
                          }}
                          disabled={deleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="card border border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {editingTier ? `Edit: ${editingTier.name}` : "Create tier"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {editingTier
                ? "Update tier details and availability."
                : "Add a new tier to group subscription plans."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="tier-name" className="text-xs font-medium">
                  Name
                </Label>
                <Input
                  id="tier-name"
                  className="input"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tier-description"
                  className="text-xs font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="tier-description"
                  className="input min-h-[70px]"
                  value={form.description}
                  onChange={handleChange("description")}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
                <div className="space-y-2">
                  <Label htmlFor="tier-level" className="text-xs font-medium">
                    Level
                  </Label>
                  <Input
                    id="tier-level"
                    type="number"
                    min={0}
                    className="input"
                    value={form.level}
                    onChange={handleChange("level")}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-slate-50 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">Active</p>
                    <p className="text-[11px] text-slate-500">
                      Show this tier in plan creation.
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isActive: checked }))
                    }
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingTier && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[var(--border)] text-xs"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="btn btn-gradient-slow text-xs"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingTier
                    ? "Save changes"
                    : "Create tier"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tier?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Delete "${deleteTarget.name}"? This cannot be undone.`
                : "Confirm deleting the selected tier."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-table-danger"
              onClick={handleDelete}
              disabled={deleting || !deleteTarget}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
