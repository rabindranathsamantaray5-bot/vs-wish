import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { startOfMonth, subMonths, format } from "date-fns";

export async function getAdminDashboardStats() {
  // 1. Totals
  const usersRes = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });
  const wishesRes = await supabaseAdmin.from("wishes").select("*", { count: "exact", head: true });
  const templatesRes = await supabaseAdmin
    .from("templates")
    .select("*", { count: "exact", head: true });
  const categoriesRes = await supabaseAdmin
    .from("categories")
    .select("*", { count: "exact", head: true });

  const usersCount = usersRes.count ?? 0;
  const wishesCount = wishesRes.count ?? 0;
  const templatesCount = templatesRes.count ?? 0;
  const categoriesCount = categoriesRes.count ?? 0;

  // Total Views (Sum of wishes.views)
  const { data: viewsData } = await supabaseAdmin.from("wishes").select("views");
  const totalViews = (viewsData || []).reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Total Revenue (Sum of purchases.amount where status is claimed/completed)
  const { data: revenueData } = await supabaseAdmin
    .from("purchases")
    .select("amount")
    .in("status", ["claimed", "completed"]);
  const totalRevenue = (revenueData || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPurchases = (revenueData || []).length;

  // 2. Time-series (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: wishesTs } = await supabaseAdmin
    .from("wishes")
    .select("created_at, views")
    .gte("created_at", thirtyDaysAgo.toISOString());

  // Aggregate by day
  const dailyStats: Record<string, { wishes: number; views: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyStats[format(d, "yyyy-MM-dd")] = { wishes: 0, views: 0 };
  }

  (wishesTs || []).forEach((w) => {
    if (!w.created_at) return;
    const day = format(new Date(w.created_at), "yyyy-MM-dd");
    if (dailyStats[day]) {
      dailyStats[day].wishes++;
      dailyStats[day].views += w.views || 0;
    }
  });

  const timeseries = Object.entries(dailyStats)
    .map(([day, stats]) => ({ day, ...stats }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // 3. Top Templates
  const { data: topTemplatesData } = await supabaseAdmin
    .from("wishes")
    .select("template_id, views");

  const templateCounts: Record<string, { count: number; views: number }> = {};
  (topTemplatesData || []).forEach((w) => {
    if (!w.template_id) return;
    const tId = w.template_id;
    if (!templateCounts[tId]) {
      templateCounts[tId] = { count: 0, views: 0 };
    }
    const current = templateCounts[tId];
    if (current) {
      current.count++;
      current.views += w.views || 0;
    }
  });

  const topTemplates = Object.entries(templateCounts)
    .map(([templateId, stats]) => ({ templateId, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 4. Growth Calculations (simplified current vs last month)
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1)).toISOString();
  const currentMonthStart = startOfMonth(new Date()).toISOString();

  const lastMonthRes = await supabaseAdmin
    .from("wishes")
    .select("*", { count: "exact", head: true })
    .lt("created_at", currentMonthStart)
    .gte("created_at", lastMonthStart);

  const currentMonthRes = await supabaseAdmin
    .from("wishes")
    .select("*", { count: "exact", head: true })
    .gte("created_at", currentMonthStart);

  const lastMonthVal = lastMonthRes.count ?? 0;
  const currentMonthVal = currentMonthRes.count ?? 0;
  const wishesGrowth =
    lastMonthVal > 0 ? ((currentMonthVal - lastMonthVal) / lastMonthVal) * 100 : 0;

  return {
    totals: {
      users: usersCount,
      wishes: wishesCount,
      templates: templatesCount,
      categories: categoriesCount,
      views: totalViews,
      revenue: totalRevenue,
      purchases: totalPurchases,
      premium: totalPurchases,
    },
    growth: {
      wishes: wishesGrowth,
      users: 0,
      views: 0,
      revenue: 0,
      premium: 0,
    },
    timeseries,
    topTemplates,
    recentActivities: [
      { type: "New wish created", detail: "Real-time activity tracking pending", time: "Just now" },
    ],
  };
}

export async function listAdminPlans() {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAdminPlan(plan: any) {
  const { data, error } = await supabaseAdmin.from("plans").insert(plan).select().single();
  if (error) throw error;
  return data;
}

export async function updateAdminPlan(id: string, plan: any) {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .update(plan)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAdminPlan(id: string) {
  const { error } = await supabaseAdmin.from("plans").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function listAdminCoupons() {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAdminCoupon(coupon: any) {
  const { data, error } = await supabaseAdmin.from("coupons").insert(coupon).select().single();
  if (error) throw error;
  return data;
}

export async function updateAdminCoupon(id: string, coupon: any) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update(coupon)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAdminCoupon(id: string) {
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function listAdminComments() {
  const { data: comments, error: commentsError } = await supabaseAdmin
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (commentsError) throw commentsError;

  const wishIds = [...new Set((comments || []).map((c) => c.wish_id))];
  const { data: wishes, error: wishesError } = await supabaseAdmin
    .from("wishes")
    .select("id, title")
    .in("id", wishIds);

  if (wishesError) throw wishesError;

  const wishMap = (wishes || []).reduce((acc: any, w: any) => {
    acc[w.id] = w.title;
    return acc;
  }, {});

  return (comments || []).map((c) => ({
    ...c,
    wishes: { title: wishMap[c.wish_id] || "Deleted Wish" },
  }));
}

export async function updateAdminComment(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from("comments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAdminComment(id: string) {
  const { error } = await supabaseAdmin.from("comments").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function getAdminSettings(type: "website" | "system" | "ai") {
  const table = `${type}_settings`;
  const { data, error } = await supabaseAdmin.from(table as any).select("*");
  if (error) throw error;

  // Convert to object
  return data.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
}

export async function updateAdminSettings(
  type: "website" | "system" | "ai",
  key: string,
  value: any,
) {
  const table = `${type}_settings`;
  const { data, error } = await supabaseAdmin
    .from(table as any)
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
