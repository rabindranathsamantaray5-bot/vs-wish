"use client";

import { useLocation, Link } from "@tanstack/react-router";
import {
  Heart,
  LayoutDashboard,
  Users,
  LayoutGrid,
  FolderKanban,
  ImageIcon,
  Crown,
  TicketPercent,
  MessageSquare,
  Settings,
  Cog,
  ChevronRight,
} from "lucide-react";

const SECTIONS = [
  {
    label: null,
    items: [{ href: "/admin", icon: LayoutDashboard, label: "Dashboard", testId: "nav-dashboard" }],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/users", icon: Users, label: "Users", testId: "nav-users" },
      { href: "/admin/templates", icon: LayoutGrid, label: "Templates", testId: "nav-templates" },
      {
        href: "/admin/categories",
        icon: FolderKanban,
        label: "Categories",
        testId: "nav-categories",
      },
      { href: "/admin/media", icon: ImageIcon, label: "Media Library", testId: "nav-media" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/admin/plans", icon: Crown, label: "Premium Plans", testId: "nav-plans" },
      { href: "/admin/coupons", icon: TicketPercent, label: "Coupons", testId: "nav-coupons" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/admin/comments", icon: MessageSquare, label: "Comments", testId: "nav-comments" },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        href: "/admin/settings/website",
        icon: Settings,
        label: "Website Settings",
        testId: "nav-website-settings",
      },
      { href: "/admin/settings/system", icon: Cog, label: "System Settings", testId: "nav-system" },
    ],
  },
];

export default function Sidebar({ collapsed = false }) {
  const pathname = useLocation().pathname;
  return (
    <aside
      data-testid="admin-sidebar"
      className={`${collapsed ? "w-[80px]" : "w-[260px]"} shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 flex flex-col transition-all duration-300`}
    >
      {/* Brand */}
      <div className="h-[76px] px-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5cf6] via-[#6d4aff] to-[#ff5fa2] grid place-items-center shrink-0 shadow-lg">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display font-bold text-[17px] text-slate-900 dark:text-slate-100 leading-none">
              WishFly
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
              Make Every Moment Special
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {SECTIONS.map((section, idx) => (
          <div key={idx}>
            {section.label && !collapsed && (
              <div className="px-3 mb-2 text-[10.5px] font-bold tracking-[0.14em] uppercase text-slate-400 dark:text-slate-500">
                {section.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      data-testid={item.testId}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                        active
                          ? "bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white shadow-lg shadow-purple-500/25"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon
                        className={`w-[18px] h-[18px] shrink-0 ${active ? "" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {active && !collapsed && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-80" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Upgrade card removed as per user request */}
    </aside>
  );
}
