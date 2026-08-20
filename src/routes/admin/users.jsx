"use client";

import { createFileRoute } from "@tanstack/react-router";
import ResourceManager from "@/components/admin/ResourceManager";
import { User, Shield, Mail, Calendar, CreditCard } from "lucide-react";

function UsersPage() {
  return (
    <ResourceManager
      resource="users"
      testIdPrefix="users"
      title="Users"
      subtitle="Manage registered users, their roles, and view their purchase history."
      defaults={{ name: "", email: "", password: "", role: "user" }}
      fields={[
        {
          key: "name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Rabindra Nath",
        },
        {
          key: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "user@example.com",
        },
        {
          key: "password",
          label: "Temporary Password",
          type: "password",
          required: true,
          placeholder: "At least 8 characters",
          minLength: 8,
          createOnly: true,
        },
        {
          key: "role",
          label: "System Role",
          type: "select",
          options: [
            { label: "Standard User", value: "user" },
            { label: "Administrator", value: "admin" },
          ],
        },
      ]}
      columns={[
        {
          key: "name",
          label: "User",
          render: (u) => (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 grid place-items-center text-purple-600 font-bold text-xs shadow-sm">
                {u.name?.charAt(0) || u.email?.charAt(0) || "?"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {u.name || "Anonymous"}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {u.email}
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "role",
          label: "Role",
          render: (u) => (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                u.role === "admin"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {u.role === "admin" ? "Admin" : "User"}
            </span>
          ),
        },
        {
          key: "purchases",
          label: "Purchases",
          render: (u) => (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="text-[13px]">{u.purchases?.length || 0} items</span>
            </div>
          ),
        },
        {
          key: "createdAt",
          label: "Joined",
          render: (u) => (
            <div className="text-slate-500 text-[12px] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
            </div>
          ),
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});
