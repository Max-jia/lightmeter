import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 获取用户的所有邮件（从数据库）
 * GET /api/emails/list
 */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 检查 Gmail 是否连接
  const { data: tokenRow } = await supabase
    .from("gmail_tokens")
    .select("id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  const { data: emails } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userData.user.id)
    .neq("status", "archived")
    .order("received_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ emails: emails || [] });
}
