import { createFileRoute } from "@tanstack/react-router";
import ResourceManager from "@/components/admin/ResourceManager";
import { TicketPercent } from "lucide-react";

function CouponsPage() {
  return (
    <ResourceManager
      resource="coupons"
      testIdPrefix="coupon"
      title="Coupons"
      subtitle="Manage discount coupons for customers."
      defaults={{
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        minimum_amount: 0,
        maximum_discount: null,
        starts_at: null,
        expires_at: null,
        usage_limit: null,
        per_user_limit: 1,
        is_active: true,
      }}
      fields={[
        {
          key: "code",
          label: "Coupon Code",
          type: "text",
          required: true,
          placeholder: "WISHFLY20",
        },
        { key: "description", label: "Description", type: "text" },
        {
          key: "discount_type",
          label: "Discount Type",
          type: "select",
          options: [
            { label: "Percentage", value: "percentage" },
            { label: "Fixed Amount", value: "fixed" },
          ],
        },
        { key: "discount_value", label: "Discount Value", type: "number", required: true },
        { key: "minimum_amount", label: "Min Purchase Amount", type: "number" },
        { key: "maximum_discount", label: "Maximum Discount", type: "number" },
        { key: "starts_at", label: "Starts At (ISO date/time)", type: "text" },
        { key: "expires_at", label: "Expires At (ISO date/time)", type: "text" },
        { key: "usage_limit", label: "Total Usage Limit", type: "number" },
        { key: "per_user_limit", label: "Per User Limit", type: "number" },
        { key: "is_active", label: "Active", type: "toggle" },
      ]}
      columns={[
        {
          key: "code",
          label: "Code",
          render: (i) => <span className="font-mono font-bold">{i.code}</span>,
        },
        {
          key: "discount_value",
          label: "Discount",
          render: (i) => `${i.discount_value}${i.discount_type === "percentage" ? "%" : " INR"}`,
        },
        { key: "is_active", label: "Status", render: (i) => (i.is_active ? "Active" : "Inactive") },
      ]}
    />
  );
}

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsPage,
});
