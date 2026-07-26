import { createClient } from "@/lib/supabase/server";
import { classifyEmail, extractClientInfo, generateReply } from "@/lib/ai/deepseek";
import { NextResponse } from "next/server";

/**
 * 批量 AI 处理所有 unread 邮件
 * POST /api/emails/process-batch
 * 用于清理 fetch 中断后卡住的 unread 邮件
 */
export async function POST() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("reply_tone, full_name, studio_name")
    .eq("id", userData.user.id)
    .single();

  const tone = (profile?.reply_tone || "professional") as "professional" | "friendly" | "minimal";
  const photographerName = profile?.full_name || "Photographer";
  const studioName = profile?.studio_name || "My Studio";

  // 取所有 unread 邮件（最多 50 封，控制超时）
  const { data: emails } = await supabase
    .from("emails")
    .select("id, gmail_id, subject, body_text, snippet, from_address")
    .eq("user_id", userData.user.id)
    .eq("status", "unread")
    .limit(50);

  if (!emails || emails.length === 0) {
    return NextResponse.json({ processed: 0, message: "No unread emails" });
  }

  let processed = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      const classification = await classifyEmail(email.subject, email.body_text || email.snippet);

      if (classification.type === "spam") {
        await supabase.from("emails").update({ ai_classification: "spam", status: "archived" }).eq("id", email.id);
        processed++;
        continue;
      }

      if (classification.type === "new_inquiry") {
        const extractedInfo = await extractClientInfo(email.subject, email.body_text || email.snippet);
        const reply = await generateReply(email.subject, email.body_text || email.snippet, extractedInfo, photographerName, studioName, tone);

        await supabase.from("emails").update({
          ai_classification: "new_inquiry", ai_confidence: reply.confidence,
          ai_draft_subject: reply.subject, ai_draft_body: reply.body,
          ai_extracted_info: extractedInfo, status: "draft_ready",
        }).eq("id", email.id);

        if (extractedInfo.name) {
          const { data: existing } = await supabase.from("clients").select("id").eq("user_id", userData.user.id).eq("email", email.from_address).maybeSingle();
          if (!existing) {
            await supabase.from("clients").insert({
              user_id: userData.user.id, name: extractedInfo.name, email: email.from_address,
              partner_name: extractedInfo.partnerName, event_type: extractedInfo.eventType || "other",
              event_date: extractedInfo.weddingDate || null, location: extractedInfo.location,
              budget: extractedInfo.budget, referral_source: extractedInfo.referralSource, status: "lead",
            });
          }
        }
        processed++;
      } else {
        await supabase.from("emails").update({ ai_classification: classification.type || "unknown", status: "read" }).eq("id", email.id);
        processed++;
      }
    } catch (err) {
      console.error("Batch AI failed for email:", email.gmail_id, err);
      await supabase.from("emails").update({ ai_classification: "unknown", status: "read" }).eq("id", email.id);
      failed++;
    }
  }

  return NextResponse.json({ processed, failed, total: emails.length });
}
