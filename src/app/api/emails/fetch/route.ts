import { createClient } from "@/lib/supabase/server";
import { fetchRecentEmails } from "@/lib/gmail/client";
import { classifyEmail, extractClientInfo, generateReply } from "@/lib/ai/deepseek";
import { NextResponse } from "next/server";

/**
 * 获取新邮件并自动 AI 分类
 * GET /api/emails/fetch
 */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: tokenRow } = await supabase
    .from("gmail_tokens")
    .select("access_token")
    .eq("user_id", userData.user.id)
    .single();

  if (!tokenRow?.access_token) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  // 获取用户偏好
  const { data: profile } = await supabase
    .from("profiles")
    .select("reply_tone, full_name, studio_name")
    .eq("id", userData.user.id)
    .single();

  const tone = (profile?.reply_tone || "professional") as "professional" | "friendly" | "minimal";
  const photographerName = profile?.full_name || "Photographer";
  const studioName = profile?.studio_name || "My Studio";

  try {
    const emails = await fetchRecentEmails(tokenRow.access_token, 20);

    let newCount = 0;
    let processedCount = 0;

    for (const email of emails) {
      const { data: existing } = await supabase
        .from("emails")
        .select("id, ai_classification")
        .eq("user_id", userData.user.id)
        .eq("gmail_id", email.gmailId)
        .maybeSingle();

      if (existing) continue; // 已存在，跳过

      // 插入新邮件
      const { data: inserted } = await supabase
        .from("emails")
        .insert({
          user_id: userData.user.id,
          gmail_id: email.gmailId,
          thread_id: email.threadId,
          from_address: email.from,
          subject: email.subject,
          body_text: email.body,
          snippet: email.snippet,
          received_at: email.date ? new Date(email.date).toISOString() : new Date().toISOString(),
          status: "unread",
        })
        .select("id")
        .single();

      newCount++;

      // AI 分类（跳过垃圾/营销邮件）
      if (!inserted || !email.body) continue;

      try {
        const classification = await classifyEmail(email.subject, email.body);

        if (classification.type === "spam") {
          await supabase.from("emails").update({ ai_classification: "spam", status: "archived" }).eq("id", inserted.id);
          continue;
        }

        if (classification.type === "new_inquiry") {
          const extractedInfo = await extractClientInfo(email.subject, email.body);
          const reply = await generateReply(
            email.subject, email.body, extractedInfo,
            photographerName, studioName, tone
          );

          await supabase.from("emails").update({
            ai_classification: "new_inquiry",
            ai_confidence: reply.confidence,
            ai_draft_subject: reply.subject,
            ai_draft_body: reply.body,
            ai_extracted_info: extractedInfo,
            status: "draft_ready",
          }).eq("id", inserted.id);

          // 自动创建客户记录
          if (extractedInfo.name) {
            const { data: existingClient } = await supabase
              .from("clients")
              .select("id")
              .eq("user_id", userData.user.id)
              .eq("email", email.from)
              .maybeSingle();

            if (!existingClient) {
              await supabase.from("clients").insert({
                user_id: userData.user.id,
                name: extractedInfo.name,
                email: email.from,
                partner_name: extractedInfo.partnerName,
                event_type: extractedInfo.eventType || "other",
                event_date: extractedInfo.weddingDate || null,
                location: extractedInfo.location,
                budget: extractedInfo.budget,
                referral_source: extractedInfo.referralSource,
                status: "lead",
              });
            }
          }

          processedCount++;
        } else if (classification.type === "client_reply") {
          await supabase.from("emails").update({
            ai_classification: "client_reply",
            ai_confidence: classification.confidence,
            status: "read",
          }).eq("id", inserted.id);
        } else {
          // unknown → 标记但不隐藏
          await supabase.from("emails").update({
            ai_classification: "unknown",
            ai_confidence: classification.confidence,
          }).eq("id", inserted.id);
        }
      } catch (aiErr) {
        console.error("AI processing failed for email:", email.gmailId, aiErr);
        // AI 失败不影响邮件入库
      }
    }

    return NextResponse.json({
      success: true,
      fetched: emails.length,
      new: newCount,
      processed: processedCount,
    });
  } catch (err: any) {
    console.error("Fetch emails error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch emails" }, { status: 500 });
  }
}
