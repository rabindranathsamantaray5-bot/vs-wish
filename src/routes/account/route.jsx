import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext } from "react";
import {
  Heart,
  User,
  LayoutDashboard,
  Package,
  LogOut,
  Menu,
  X,
  Home,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Eye,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { authenticatedFetch } from "@/lib/auth-client";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

const UserCtx = createContext(null);
export const useCustomer = () => useContext(UserCtx);

const NAV = [
  { href: "/account", icon: LayoutDashboard, label: "Overview", testId: "act-nav-overview" },
  { href: "/account/wishes", icon: Heart, label: "My Wishes", testId: "act-nav-wishes" },
  { href: "/account/purchases", icon: Package, label: "My Purchases", testId: "act-nav-purchases" },
  { href: "/account/settings", icon: User, label: "Profile Settings", testId: "act-nav-settings" },
];

/* ---------------- Dark Mode Toggle ---------------- */
const DarkToggle = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("wc-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wc-theme", next ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      className="relative w-10 h-10 grid place-items-center rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition"
    >
      {dark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
};

function SidebarNav({ pathname, onNavigate }) {
  return (
    <ul className="space-y-0.5">
      {(NAV || []).map((n) => {
        const active =
          pathname === n.href ||
          (n.href === "/account" && (pathname === "/account" || pathname === "/account/"));
        return (
          <li key={n.href}>
            <a
              href={n.href}
              onClick={(e) => {
                if (onNavigate) onNavigate();
              }}
              data-testid={n.testId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition ${active ? "bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white shadow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <n.icon className="w-[18px] h-[18px]" />
              {n.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function AccountLayout() {
  const { site } = usePublicSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthPage = pathname === "/account/login" || pathname === "/account/register";

  useEffect(() => {
    if (isAuthPage) {
      // Clear user state if we are on login/register pages
      setUser(null);
      setChecking(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const sessionUser = data.session?.user;
        if (sessionUser) {
          const metadata = sessionUser.user_metadata || {};
          setUser({
            ...sessionUser,
            name: metadata.full_name || sessionUser.email?.split("@")[0] || "User",
            avatarUrl: metadata.avatar_url || "",
            phone: metadata.phone || "",
          });
        } else navigate({ to: "/account/login", replace: true });
        setChecking(false);
      })
      .catch(() => {
        navigate({ to: "/account/login", replace: true });
        setChecking(false);
      });
  }, [pathname, isAuthPage, navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate({ to: "/", replace: true });
  };

  if (isAuthPage)
    return (
      <UserCtx.Provider value={{ user, setUser }}>
        <Outlet />
      </UserCtx.Provider>
    );
  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-[#6d4aff] animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <UserCtx.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1200px] mx-auto h-[68px] px-4 sm:px-6 flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              data-testid="act-menu-btn"
              className="md:hidden w-10 h-10 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <a href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8b5cf6] via-[#6d4aff] to-[#ff5fa2] grid place-items-center shrink-0">
                <Heart className="w-4.5 h-4.5 text-white fill-white" />
              </div>
              <div className="hidden sm:block leading-none">
                <div className="font-display font-bold text-[16px] text-slate-900 dark:text-slate-100">
                  {site.siteName}
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1">My Account</div>
              </div>
            </a>
            <div className="ml-auto flex items-center gap-2">
              <a
                href="/"
                className="hidden sm:inline-flex h-10 px-4 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[13px] font-semibold items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" /> Home
              </a>
              <div className="flex items-center gap-2.5 pl-2 pr-3 h-10 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-[12px] font-bold">
                  {(user.name || "U")[0].toUpperCase()}
                </div>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 hidden sm:inline">
                  {user.name?.split(" ")[0]}
                </span>
              </div>
              <DarkToggle />
              <button
                onClick={logout}
                data-testid="act-logout"
                className="w-10 h-10 grid place-items-center rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 hover:bg-rose-100"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex gap-6">
          <aside className="hidden md:block w-[240px] shrink-0">
            <div className="sticky top-[88px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-3">
              <SidebarNav pathname={pathname} />
            </div>
          </aside>

          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
                onClick={() => setDrawerOpen(false)}
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-display font-bold text-[16px]">My Account</div>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <SidebarNav pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1 min-w-0">
            {pathname === "/account" || pathname === "/account/" ? <AccountOverview /> : <Outlet />}
          </main>
        </div>
      </div>
    </UserCtx.Provider>
  );
}

function AccountOverview() {
  const { user } = useCustomer() || {};
  const [wishes, setWishes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authenticatedFetch("/api/account/wishes").then((r) => (r.ok ? r.json() : { items: [] })),
      authenticatedFetch("/api/account/purchases").then((r) => (r.ok ? r.json() : { items: [] })),
    ])
      .then(([w, p]) => {
        setWishes(w.items || []);
        setPurchases(p.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Total Wishes",
      value: (wishes || []).length,
      icon: Heart,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Wishes Sent",
      value: (wishes || []).filter((w) => w.sent).length,
      icon: Sparkles,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Total Purchases",
      value: (purchases || []).length,
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Wish Coins",
      value: user?.coins || 0,
      icon: Heart,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[14px] mt-1">
            Here's what's happening with your wishes.
          </p>
        </div>
        <a
          href="/templates"
          className="inline-flex items-center justify-center gap-2 px-5 h-11 bg-[#6d4aff] hover:bg-[#5b3edb] text-white rounded-xl font-semibold transition shadow-lg shadow-purple-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" /> Create New Wish
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(stats || []).map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-xl grid place-items-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              {s.label}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[15px]">
              <TrendingUp className="w-4 h-4 text-[#6d4aff]" /> Recent Wishes
            </div>
            <a
              href="/account/wishes"
              className="text-[12px] font-semibold text-[#6d4aff] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="p-2">
            {loading ? (
              <SkeletonList />
            ) : (wishes || []).length === 0 ? (
              <EmptyState icon={Heart} label="No wishes created yet" />
            ) : (
              <ul className="space-y-1">
                {(wishes || []).slice(0, 4).map((w) => (
                  <li key={w.id}>
                    <a
                      href={`/wish/${w.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                        {w.previewUrl ? (
                          <img src={w.previewUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center">
                            <Heart className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-slate-900 dark:text-slate-100 truncate">
                          {w.recipientName || "Untitled Wish"}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {w.createdAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {w.views || 0}
                          </span>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[15px]">
              <Package className="w-4 h-4 text-pink-500" /> Recent Purchases
            </div>
            <a
              href="/account/purchases"
              className="text-[12px] font-semibold text-pink-500 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="p-2">
            {loading ? (
              <SkeletonList />
            ) : (purchases || []).length === 0 ? (
              <EmptyState icon={Package} label="No purchases yet" />
            ) : (
              <ul className="space-y-1">
                {(purchases || []).slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-pink-900/20 grid place-items-center shrink-0">
                        <Package className="w-4 h-4 text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-slate-900 dark:text-slate-100 truncate">
                          {p.templateName}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            ${p.amount}
                          </span>
                          <span>{p.date}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3 p-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 p-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 grid place-items-center mb-4">
        <Icon className="w-8 h-8 text-slate-300 dark:text-slate-700" />
      </div>
      <div className="text-[14px] font-medium text-slate-400">{label}</div>
    </div>
  );
}

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});
