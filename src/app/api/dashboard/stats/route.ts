import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Dashboard 统计数据
 * GET /api/dashboard/stats
 */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // 并行查询
  const [clientsResult, emailsResult, paymentsResult, profileResult] = await Promise.all([
    supabase.from("clients").select("id, status").eq("user_id", userId),
    supabase
      .from("emails")
      .select("id, status, ai_classification, received_at")
      .eq("user_id", userId)
      .eq("status", "draft_ready"),
    supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase.from("profiles").select("plan, trial_ends_at").eq("id", userId).single(),
  ]);

  const activeClients = clientsResult.data?.filter((c) => c.status === "active").length || 0;
  const totalClients = clientsResult.data?.length || 0;
  const draftsReady = emailsResult.data?.length || 0;

  // 本月收入
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlyRevenue =
    paymentsResult.data
      ?.filter((p) => p.paid_at && p.paid_at >= monthStart)
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // 本月咨询数
  const monthlyInquiries =
    emailsResult.data?.filter((e) => e.received_at && e.received_at >= monthStart).length || 0;

  return NextResponse.json({
    monthlyRevenue: `$${(monthlyRevenue / 100).toLocaleString()}`,
    activeClients,
    totalClients,
    draftsReady,
    monthlyInquiries,
    plan: profileResult.data?.plan || "standard",
    trialEndsAt: profileResult.data?.trial_ends_at,
  });
}
