import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/gmail/client";
import { NextResponse } from "next/server";

/**
 * 发送邮件（AI 草稿或手动编辑后的回复）
 * POST /api/emails/send — body: { emailId, subject, body }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { emailId, subject, body } = await request.json();
  if (!emailId || !subject || !body) {
    return NextResponse.json({ error: "emailId, subject, body required" }, { status: 400 });
  }

  // 获取 Gmail token
  const { data: tokenRow } = await supabase
    .from("gmail_tokens")
    .select("access_token")
    .eq("user_id", userData.user.id)
    .single();

  if (!tokenRow?.access_token) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  // 获取原始邮件
  const { data: email } = await supabase
    .from("emails")
    .select("from_address, subject")
    .eq("id", emailId)
    .eq("user_id", userData.user.id)
    .single();

  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  try {
    // 提取收件人地址
    const toMatch = email.from_address.match(/<(.+?)>/) || [null, email.from_address];
    const to = toMatch[1] || email.from_address;

    // 发送
    await sendEmail(tokenRow.access_token, to, subject, body);

    // 更新状态
    await supabase
      .from("emails")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", emailId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: err.message || "Failed to send" }, { status: 500 });
  }
}
