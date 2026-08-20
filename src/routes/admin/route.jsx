import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { supabase } from "@/integrations/supabase/client";

// Ported from the original admin/layout.js TITLES map
const TITLES = {
  "/admin/categories": { title: "Categories", subtitle: "Manage homepage categories" },
  "/admin": { title: "Dashboard", subtitle: "Welcome back, Admin" },
  "/admin/templates": { title: "Templates", subtitle: "Create and manage wish templates" },
  "/admin/users": { title: "Users", subtitle: "Manage registered users and roles" },
  "/admin/media": { title: "Media Library", subtitle: "Images, videos, and assets" },
  "/admin/plans": { title: "Premium Plans", subtitle: "Subscription tiers and pricing" },
  "/admin/coupons": { title: "Coupons", subtitle: "Discount codes and promotions" },
  "/admin/comments": { title: "Comments", subtitle: "Moderate wish interactions" },
  "/admin/settings/website": {
    title: "Website Settings",
    subtitle: "General site configuration and identity",
  },
  "/admin/settings/system": {
    title: "System Settings",
    subtitle: "Performance and technical configuration",
  },
};

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, "");
  const isLogin = path === "/admin/login";
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }

    setReady(false);

    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }

      // Verify admin role
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      if (error || !isAdmin) {
        // Not an admin, sign out and redirect
        await supabase.auth.signOut();
        navigate({ to: "/admin/login", replace: true });
        return;
      }

      setUser({ ...session.user, role: "admin" });
      setReady(true);
    };

    checkAdmin();
  }, [isLogin, path]);

  if (isLogin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-[#6d4aff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-purple-500/30">
      <div
        className={`fixed inset-0 z-40 lg:relative lg:z-auto transition-opacity duration-300 lg:transition-none ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto"}`}
      >
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`relative transition-transform duration-300 lg:transition-none ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={(TITLES[path] || { title: "Admin", subtitle: "" }).title}
          subtitle={(TITLES[path] || { title: "Admin", subtitle: "" }).subtitle}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) setMobileOpen(!mobileOpen);
            else setSidebarCollapsed(!sidebarCollapsed);
          }}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});
