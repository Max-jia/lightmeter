import { createClient } from "@/lib/supabase/server";
import { fetchRecentEmails } from "@/lib/gmail/client";
import { NextResponse } from "next/server";

/**
 * 获取并处理新邮件
 * GET /api/emails/fetch — 从 Gmail 拉取新邮件，存入数据库
 * POST /api/emails/fetch — 同上 + 触发 AI 处理
 */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 获取 Gmail token
  const { data: tokenRow } = await supabase
    .from("gmail_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userData.user.id)
    .single();

  if (!tokenRow?.access_token) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  try {
    // 从 Gmail 拉取最近 20 封未处理的邮件
    const emails = await fetchRecentEmails(tokenRow.access_token, 20);

    let newCount = 0;
    for (const email of emails) {
      // 检查是否已存在
      const { data: existing } = await supabase
        .from("emails")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("gmail_id", email.gmailId)
        .maybeSingle();

      if (!existing) {
        await supabase.from("emails").insert({
          user_id: userData.user.id,
          gmail_id: email.gmailId,
          thread_id: email.threadId,
          from_address: email.from,
          subject: email.subject,
          body_text: email.body,
          snippet: email.snippet,
          received_at: email.date ? new Date(email.date).toISOString() : new Date().toISOString(),
          status: "unread",
        });
        newCount++;
      }
    }

    return NextResponse.json({ success: true, fetched: emails.length, new: newCount });
  } catch (err: any) {
    console.error("Fetch emails error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch emails" }, { status: 500 });
  }
}
