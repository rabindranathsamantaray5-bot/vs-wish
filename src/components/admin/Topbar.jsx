"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, Menu, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function Topbar({ title, subtitle, onToggleSidebar }) {
  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [me, setMe] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("wf-theme") === "dark";
    setDark(saved);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", saved);
    }

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setMe(session.user);
      }
    };

    getSession();
  }, []);

  const toggleTheme = () => {
    const n = !dark;
    setDark(n);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", n);
      localStorage.setItem("wf-theme", n ? "dark" : "light");
    }
  };

  const logout = async () => {
    // 1. Sign out from Supabase client-side
    await supabase.auth.signOut();

    // 2. Call server-side logout to clear any potential mock cookies
    await fetch("/api/admin/logout", { method: "POST" });

    // 3. Clear any legacy mock session markers
    if (typeof window !== "undefined") {
      localStorage.removeItem("wf_admin_session");
    }

    // 4. Redirect
    router({ to: "/admin/login" });
  };

  return (
    <header
      data-testid="admin-topbar"
      className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"
    >
      <div className="h-[76px] px-6 flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          data-testid="sidebar-toggle"
          className="w-10 h-10 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-[22px] text-slate-900 dark:text-slate-50 leading-none truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="ml-auto hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            data-testid="global-search"
            placeholder="Search anything..."
            className="h-10 w-[300px] pl-10 pr-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-300 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition"
          />
          <div className="absolute right-3 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm inline-flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          data-testid="theme-toggle"
          className="w-10 h-10 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 ml-auto md:ml-2"
        >
          {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        <button
          data-testid="notifications-btn"
          className="relative w-10 h-10 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-[#ff5fa2] to-[#ff9f43] text-white text-[10px] font-bold grid place-items-center">
            12
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            data-testid="profile-btn"
            className="flex items-center gap-2.5 pl-1 pr-3 h-11 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white font-bold text-sm shadow">
              A
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                Admin
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Super Admin</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    {me?.email || "Admin"}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Super Administrator
                  </div>
                </div>
                <button
                  onClick={logout}
                  data-testid="logout-btn"
                  className="w-full text-left px-4 py-3 text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
