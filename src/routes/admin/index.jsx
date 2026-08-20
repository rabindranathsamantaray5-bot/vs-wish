import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/admin/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Users,
  FolderKanban,
  Eye,
  Crown,
  IndianRupee,
  Sparkles,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  LayoutGrid,
  ImagePlus,
  TicketPercent,
  BarChart3,
  Settings,
  Megaphone,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getAdminDashboardStats } from "@/lib/admin-features.functions";

const fmt = (n) => n?.toLocaleString?.("en-IN") || "0";

const DEVICE_COLORS = ["#6d4aff", "#8b5cf6", "#ff9f43", "#94a3b8"];
const COUNTRY_ROWS = [
  { name: "India", value: 68.2, color: "#6d4aff" },
  { name: "United States", value: 12.4, color: "#8b5cf6" },
  { name: "Indonesia", value: 4.6, color: "#ff9f43" },
  { name: "Brazil", value: 2.8, color: "#22c55e" },
  { name: "United Kingdom", value: 2.1, color: "#38bdf8" },
  { name: "Other Countries", value: 9.9, color: "#cbd5e1" },
];

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const getStats = useServerFn(getAdminDashboardStats);

  useEffect(() => {
    getStats()
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch admin stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-[#6d4aff] animate-spin" />
      </div>
    );
  }

  const t = stats?.totals || {};
  const series = (stats?.timeseries || []).map((x) => ({
    day: x.day?.split("-").slice(1).join("/") || "",
    wishes: x.wishes || 0,
    views: x.views || 0,
  }));
  const topTemplates = stats?.topTemplates || [];

  const users = t.users || 0;
  const wishes = t.wishes || 0;
  const views = t.views || 0;
  const revenue = t.revenue || 0;
  const premium = t.premium || 0;

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          testId="stat-users"
          label="Total Users"
          value={fmt(users)}
          change={stats?.growth?.users || 0}
          icon={Users}
          gradient="from-[#6d4aff] to-[#8b5cf6]"
        />
        <StatCard
          testId="stat-wishes"
          label="Wishes Created"
          value={fmt(wishes)}
          change={stats?.growth?.wishes || 0}
          icon={FolderKanban}
          gradient="from-[#38bdf8] to-[#6d4aff]"
        />
        <StatCard
          testId="stat-views"
          label="Total Views"
          value={fmt(views)}
          change={stats?.growth?.views || 0}
          icon={Eye}
          gradient="from-[#ff5fa2] to-[#ff9f43]"
        />
        <StatCard
          testId="stat-premium"
          label="Premium Users"
          value={fmt(premium)}
          change={stats?.growth?.premium || 0}
          icon={Crown}
          gradient="from-[#f59e0b] to-[#ff9f43]"
        />
        <StatCard
          testId="stat-revenue"
          label="Total Revenue"
          value={`₹${fmt(revenue)}`}
          change={stats?.growth?.revenue || 0}
          icon={IndianRupee}
          gradient="from-[#22c55e] to-[#10b981]"
        />
      </div>

      {/* Row: Overview chart + Top templates + Today's stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Overview chart */}
        <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                Overview Chart
              </div>
              <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Wishes vs Views · last 30 days
              </div>
            </div>
            <div className="text-[11.5px] font-semibold text-slate-500 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              This Month
            </div>
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series.length ? series : [{ day: "now", wishes: 0, views: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#6d4aff"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="wishes"
                  stroke="#ff5fa2"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11.5px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6d4aff]" />
              Views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5fa2]" />
              Wishes
            </span>
          </div>
        </div>

        {/* Top templates */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
              Top Templates
            </div>
            <Link
              to="/admin/templates"
              className="text-[11.5px] font-semibold text-[#6d4aff] hover:underline"
            >
              View All
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(topTemplates.length
              ? topTemplates
              : [{ templateId: "No data yet", views: 0, count: 0 }]
            )
              .slice(0, 6)
              .map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 grid place-items-center text-lg shadow-sm">
                    {["🎂", "💐", "💍", "🎉", "👶", "🎁"][i % 6]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 capitalize truncate">
                      {t.templateId}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Views: {fmt(t.views)}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#6d4aff]">
                    {i < 3 ? "Premium" : "Free"}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Today's stats — purple gradient panel */}
        <div className="lg:col-span-3 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden bg-gradient-to-br from-[#6d4aff] via-[#7c3aed] to-[#8b5cf6]">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="text-[15px] font-bold">Today's Stats</div>
            <ul className="mt-4 space-y-3.5">
              {[
                {
                  k: "Total Users",
                  v: fmt(users),
                  d: stats?.growth?.users
                    ? `${stats.growth.users > 0 ? "+" : ""}${stats.growth.users}%`
                    : "0%",
                },
                {
                  k: "Wishes Created",
                  v: fmt(wishes),
                  d: stats?.growth?.wishes
                    ? `${stats.growth.wishes > 0 ? "+" : ""}${stats.growth.wishes}%`
                    : "0%",
                },
                {
                  k: "Total Views",
                  v: fmt(views),
                  d: stats?.growth?.views
                    ? `${stats.growth.views > 0 ? "+" : ""}${stats.growth.views}%`
                    : "0%",
                },
                {
                  k: "Revenue",
                  v: `₹${fmt(revenue)}`,
                  d: stats?.growth?.revenue
                    ? `${stats.growth.revenue > 0 ? "+" : ""}${stats.growth.revenue}%`
                    : "0%",
                },
              ].map((r, i) => (
                <li key={i} className="flex items-center justify-between text-[13px]">
                  <span className="opacity-90">{r.k}</span>
                  <span className="inline-flex items-center gap-2 font-semibold">
                    {r.v} <span className="text-[10px] opacity-80">{r.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            {/* Mini bar visualization */}
            <div className="mt-6 h-16 flex items-end gap-1.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-white/25"
                  style={{ height: `${20 + ((i * 17) % 80)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Users by device + Users by country + Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
            Users By Device
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-[140px] h-[140px] relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { n: "Mobile", v: 68.5 },
                      { n: "Desktop", v: 24.6 },
                      { n: "Tablet", v: 6.2 },
                      { n: "Other", v: 0.7 },
                    ]}
                    dataKey="v"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {DEVICE_COLORS.map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="font-display font-bold text-[16px] text-slate-900 dark:text-slate-100">
                    {fmt(users)}
                  </div>
                  <div className="text-[9px] text-slate-500">Total</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-2">
              {[
                { n: "Mobile", v: "68.5%", c: DEVICE_COLORS[0] },
                { n: "Desktop", v: "24.6%", c: DEVICE_COLORS[1] },
                { n: "Tablet", v: "6.2%", c: DEVICE_COLORS[2] },
                { n: "Other", v: "0.7%", c: DEVICE_COLORS[3] },
              ].map((r) => (
                <li key={r.n} className="flex items-center justify-between text-[12.5px]">
                  <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ background: r.c }} />
                    {r.n}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{r.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
            Users By Country
          </div>
          <ul className="mt-4 space-y-3">
            {COUNTRY_ROWS.map((r) => (
              <li key={r.name} className="text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                    {r.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {r.value.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.value}%`, background: r.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
              Recent Activities
            </div>
            <Link
              to="/admin/comments"
              className="text-[11.5px] font-semibold text-[#6d4aff] hover:underline"
            >
              View All
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {[
              {
                i: Users,
                c: "from-purple-100 to-pink-100 text-[#6d4aff]",
                t: "New user registered",
                s: stats?.recentWishes?.[0]?.from || "Rohit Sharma",
                r: "2 min ago",
              },
              {
                i: Sparkles,
                c: "from-pink-100 to-orange-100 text-[#ff5fa2]",
                t: "New wish created",
                s: stats?.recentWishes?.[0]?.title || "Birthday Wish for Neha",
                r: "5 min ago",
              },
              {
                i: Crown,
                c: "from-amber-100 to-orange-100 text-amber-600",
                t: "Payment received",
                s: "Premium Plan · ₹1,999",
                r: "10 min ago",
              },
              {
                i: LayoutGrid,
                c: "from-emerald-100 to-teal-100 text-emerald-600",
                t: "New template added",
                s: "Anniversary Love",
                r: "15 min ago",
              },
              {
                i: TrendingUp,
                c: "from-sky-100 to-blue-100 text-sky-600",
                t: "User upgraded to premium",
                s: "Priya Patel",
                r: "20 min ago",
              },
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.c} grid place-items-center shrink-0`}
                >
                  <a.i className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {a.t}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {a.s}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">{a.r}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row: Quick actions + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            {
              href: "/admin/templates",
              icon: LayoutGrid,
              label: "Add Template",
              sub: "Create new template",
              c: "from-purple-500 to-violet-500",
            },
            {
              href: "/admin/categories",
              icon: FolderKanban,
              label: "Add Category",
              sub: "Create new category",
              c: "from-sky-500 to-blue-500",
            },
            {
              href: "/admin/media",
              icon: ImagePlus,
              label: "Upload Media",
              sub: "Add images, videos, music",
              c: "from-orange-500 to-amber-500",
            },
            {
              href: "/admin/festival-scheduler",
              icon: Sparkles,
              label: "Festival Scheduler",
              sub: "Manage festival themes",
              c: "from-pink-500 to-rose-500",
            },
            {
              href: "/admin/analytics",
              icon: BarChart3,
              label: "View Analytics",
              sub: "Detailed analytics",
              c: "from-emerald-500 to-teal-500",
            },
          ].map((q) => (
            <Link
              key={q.href}
              to={q.href}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${q.c} grid place-items-center text-white shadow`}
              >
                <q.icon className="w-5 h-5" />
              </div>
              <div className="mt-3 text-[13px] font-bold text-slate-900 dark:text-slate-100">
                {q.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{q.sub}</div>
            </Link>
          ))}
        </div>

        {/* Quick links panel */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
            Quick Links
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { href: "/admin/users", icon: Users, label: "Users" },
              { href: "/admin/templates", icon: LayoutGrid, label: "Templates" },
              { href: "/admin/categories", icon: FolderKanban, label: "Categories" },
              { href: "/admin/payments", icon: TicketPercent, label: "Payments" },
              { href: "/admin/settings/website", icon: Settings, label: "Settings" },
              { href: "/admin/settings/seo", icon: HelpCircle, label: "SEO" },
              { href: "/admin/settings/ai", icon: Sparkles, label: "AI Tools" },
              { href: "/", icon: LogOut, label: "View Site" },
            ].map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition"
              >
                <div className="w-9 h-9 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-600 dark:text-slate-300">
                  <l.icon className="w-4 h-4" />
                </div>
                <div className="text-[10.5px] mt-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  {l.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue overview */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
            Revenue Overview
          </div>
          <div className="text-[11.5px] font-semibold text-slate-500 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
            This Year
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Total Revenue",
              v: `₹${fmt(revenue)}`,
              c: stats?.growth?.revenue
                ? `${stats.growth.revenue > 0 ? "+" : ""}${stats.growth.revenue}% vs last period`
                : "0% vs last period",
            },
            {
              label: "Active Users",
              v: fmt(users),
              c: stats?.growth?.users
                ? `${stats.growth.users > 0 ? "+" : ""}${stats.growth.users}% vs last period`
                : "0% vs last period",
            },
            {
              label: "Total Wishes",
              v: fmt(wishes),
              c: stats?.growth?.wishes
                ? `${stats.growth.wishes > 0 ? "+" : ""}${stats.growth.wishes}% vs last period`
                : "0% vs last period",
            },
          ].map((r, i) => (
            <div key={i}>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">{r.label}</div>
              <div className="mt-1 font-display font-bold text-[22px] text-slate-900 dark:text-slate-50">
                {r.v}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">↑ {r.c}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-[180px]">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={series.length ? series : [{ m: "now", v: 0 }]}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d4aff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6d4aff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#6d4aff"
                strokeWidth={2.5}
                fill="url(#gRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — WishFly" },
      { name: "description", content: "WishFly platform administration and statistics overview." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — WishFly" },
      { property: "og:description", content: "WishFly platform administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});
