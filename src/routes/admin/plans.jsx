import { createFileRoute } from "@tanstack/react-router";
import ResourceManager from "@/components/admin/ResourceManager";
import { Crown, List, CheckCircle, Eye, EyeOff, Hash } from "lucide-react";

function PlansPage() {
  return (
    <ResourceManager
      resource="plans"
      testIdPrefix="plan"
      title="Premium Plans"
      subtitle="Define and manage subscription tiers. Set pricing, billing, and features."
      defaults={{
        name: "",
        slug: "",
        price: 0,
        currency: "INR",
        billing_period: "monthly",
        is_active: true,
        is_visible: true,
        display_order: 0,
        features: [],
      }}
      fields={[
        {
          key: "name",
          label: "Plan Name",
          type: "text",
          required: true,
          placeholder: "Premium Tier",
        },
        {
          key: "slug",
          label: "Slug (URL identifier)",
          type: "text",
          required: true,
          placeholder: "premium",
        },
        { key: "price", label: "Price", type: "number", required: true },
        {
          key: "billing_period",
          label: "Billing Period",
          type: "select",
          options: [
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
            { label: "One-time", value: "lifetime" },
          ],
        },
        { key: "display_order", label: "Display Order", type: "number" },
        { key: "is_active", label: "Active", type: "toggle" },
        { key: "is_visible", label: "Visible to Customers", type: "toggle" },
        {
          key: "features",
          label: "Features (one per line)",
          type: "list",
          placeholder: "Unlimited wishes\nAll templates\nAI generation",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Plan",
          render: (i) => (
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <div className="font-semibold">{i.name}</div>
            </div>
          ),
        },
        {
          key: "price",
          label: "Price",
          render: (i) => (
            <div className="text-slate-600 dark:text-slate-400">
              {i.price} {i.currency} / {i.billing_period}
            </div>
          ),
        },
        {
          key: "is_active",
          label: "Status",
          render: (i) => (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${i.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
            >
              {i.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
        {
          key: "is_visible",
          label: "Visibility",
          render: (i) =>
            i.is_visible ? (
              <Eye className="w-4 h-4 text-blue-500" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400" />
            ),
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/admin/plans")({
  component: PlansPage,
});
