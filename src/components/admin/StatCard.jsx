"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  gradient = "from-[#6d4aff] to-[#8b5cf6]",
  suffix = "",
  testId,
}) {
  const positive =
    typeof change === "number"
      ? change >= 0
      : String(change || "").startsWith("+") || (change && !String(change).startsWith("-"));
  return (
    <motion.div
      data-testid={testId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="relative rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} grid place-items-center text-white shadow-lg`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`inline-flex items-center gap-0.5 text-[11.5px] font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}
          >
            {positive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {typeof change === "number" ? `${Math.abs(change).toFixed(1)}%` : change}
          </div>
        )}
      </div>
      <div className="mt-4 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-display font-bold text-[26px] text-slate-900 dark:text-slate-50 leading-tight">
        {value}
        {suffix}
      </div>
      <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">vs last month</div>
    </motion.div>
  );
}
