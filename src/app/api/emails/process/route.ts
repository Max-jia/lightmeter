import { createClient } from "@/lib/supabase/server";
import { classifyEmail, extractClientInfo, generateReply } from "@/lib/ai/deepseek";
import { NextResponse } from "next/server";

/**
 * AI 处理单封邮件
 * POST /api/emails/process — body: { emailId }
 * 调用 DeepSeek：分类 → 提取信息 → 生成回复草稿 → 更新数据库
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { emailId } = await request.json();
  if (!emailId) {
    return NextResponse.json({ error: "emailId is required" }, { status: 400 });
  }

  // 获取邮件
  const { data: email } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .eq("user_id", userData.user.id)
    .single();

  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  // 获取用户偏好
  const { data: profile } = await supabase
    .from("profiles")
    .select("reply_tone, studio_name, full_name")
    .eq("id", userData.user.id)
    .single();

  const tone = (profile?.reply_tone || "professional") as "professional" | "friendly" | "minimal";
  const photographerName = profile?.full_name || "Photographer";
  const studioName = profile?.studio_name || "My Studio";

  try {
    // 1. 分类
    const classification = await classifyEmail(email.subject, email.body_text || email.snippet);
    const updates: Record<string, any> = {
      ai_classification: classification.type,
      ai_confidence: classification.confidence,
    };

    // 2. 如果是新咨询，提取信息 + 生成回复
    if (classification.type === "new_inquiry") {
      const extractedInfo = await extractClientInfo(email.subject, email.body_text || email.snippet);
      const reply = await generateReply(
        email.subject,
        email.body_text || email.snippet,
        extractedInfo,
        photographerName,
        studioName,
        tone
      );

      updates.ai_draft_subject = reply.subject;
      updates.ai_draft_body = reply.body;
      updates.ai_extracted_info = extractedInfo;
      updates.ai_confidence = reply.confidence; // 回复置信度
      updates.status = "draft_ready";

      // 自动创建/更新客户记录
      if (extractedInfo.name) {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("email", email.from_address)
          .maybeSingle();

        if (existingClient) {
          // 关联已有客户
          updates.client_id = existingClient.id;
        } else {
          // 创建新客户
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              user_id: userData.user.id,
              name: extractedInfo.name,
              email: email.from_address,
              partner_name: extractedInfo.partnerName,
              event_type: extractedInfo.eventType || "other",
              event_date: extractedInfo.weddingDate || null,
              location: extractedInfo.location,
              budget: extractedInfo.budget,
              referral_source: extractedInfo.referralSource,
              status: "lead",
            })
            .select("id")
            .single();

          if (newClient) {
            updates.client_id = newClient.id;
          }
        }
      }
    } else if (classification.type === "spam") {
      updates.status = "archived";
    } else {
      updates.status = "read";
    }

    // 更新邮件
    await supabase.from("emails").update(updates).eq("id", emailId);

    return NextResponse.json({ success: true, classification: classification.type, updates });
  } catch (err: any) {
    console.error("AI process error:", err);
    return NextResponse.json({ error: err.message || "AI processing failed" }, { status: 500 });
  }
}
