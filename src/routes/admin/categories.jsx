import { createFileRoute } from "@tanstack/react-router";
("use client");

import ResourceManager from "@/components/admin/ResourceManager";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getCategoryBackgroundStyle } from "@/lib/category-display";

function CategoriesPage() {
  return (
    <ResourceManager
      resource="categories"
      testIdPrefix="categories"
      title="Categories"
      subtitle="Occasions shown on the homepage grid. Name, icon, background, order and visibility update the live site."
      defaults={{ active: true, order: 0, bg: "from-purple-100 to-pink-100" }}
      fields={[
        {
          key: "name",
          label: "Category Name",
          type: "text",
          required: true,
          placeholder: "Birthday",
        },
        {
          key: "img",
          label: "Icon (emoji or image URL)",
          type: "text",
          placeholder: "🎂 or https://example.com/icon.png",
        },
        {
          key: "bg",
          label: "Background Gradient (Tailwind classes)",
          type: "text",
          placeholder: "from-purple-100 to-pink-100",
        },
        { key: "order", label: "Display Order", type: "number" },
        { key: "active", label: "Show on site", type: "toggle" },
      ]}
      columns={[
        {
          key: "img",
          label: "Icon",
          render: (i) => (
            <div className="w-12 h-12 rounded-xl bg-slate-100 grid place-items-center p-1.5">
              <CategoryIcon
                value={i.img}
                name={i.name}
                imageClassName="w-full h-full object-contain"
                emojiClassName="text-3xl leading-none"
              />
            </div>
          ),
        },
        { key: "name", label: "Name" },
        {
          key: "bg",
          label: "Background",
          render: (i) => (
            <div
              className="h-6 w-24 rounded-md border border-slate-200"
              style={getCategoryBackgroundStyle(i.bg)}
            />
          ),
        },
        { key: "order", label: "Order" },
        {
          key: "active",
          label: "Status",
          render: (i) => (
            <span
              className={`text-[13px] font-semibold px-2 py-1 rounded-full ${i.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
            >
              {i.active ? "Active" : "Hidden"}
            </span>
          ),
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});
