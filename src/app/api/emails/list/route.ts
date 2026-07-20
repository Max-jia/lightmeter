import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 获取用户的摄影相关邮件（已 AI 过滤）
 * GET /api/emails/list
 */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: tokenRow } = await supabase
    .from("gmail_tokens")
    .select("id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  // 只显示摄影相关邮件：新咨询、客户回复、未处理的
  const { data: emails } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userData.user.id)
    .in("ai_classification", ["new_inquiry", "client_reply", null])
    .neq("status", "archived")
    .order("received_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ emails: emails || [] });
}
