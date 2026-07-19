import OpenAI from "openai";

/**
 * DeepSeek AI 客户端
 * DeepSeek API 兼容 OpenAI SDK，只需改 baseURL 和 apiKey
 */
const MODEL = "deepseek-chat";

/** 懒加载 DeepSeek 客户端，避免构建时缺少环境变量报错 */
function getClient() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }
  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}

interface EmailClassification {
  type: "new_inquiry" | "client_reply" | "spam" | "unknown";
  confidence: number; // 0-100
  reason: string;
}

interface ExtractedClientInfo {
  name: string | null;
  partnerName: string | null;
  weddingDate: string | null;
  eventType: string | null; // "wedding" | "portrait" | "event" | "other"
  budget: string | null;
  location: string | null;
  referralSource: string | null;
}

interface GeneratedReply {
  subject: string;
  body: string;
  tone: string; // "professional" | "friendly" | "minimal"
  confidence: number; // 0-100 — 是否可直接发送
}

/**
 * 分类邮件类型（新咨询 / 客户回复 / 垃圾邮件）
 */
export async function classifyEmail(
  subject: string,
  body: string
): Promise<EmailClassification> {
  const prompt = `You are an email classifier for a wedding photographer.
Classify this email into one of: "new_inquiry", "client_reply", "spam", "unknown".

Return ONLY a JSON object with:
- "type": the classification
- "confidence": 0-100 (how sure you are)
- "reason": one short sentence explaining why

Rules:
- "new_inquiry": someone asking about photography services, pricing, availability for the first time
- "client_reply": an existing client responding to an ongoing conversation (mentions contract, payment, timeline, shooting details, etc.)
- "spam": marketing, cold outreach, newsletters
- "unknown": can't confidently classify

Subject: ${subject}
Body: ${body.slice(0, 2000)}`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 200,
  });

  const text = response.choices[0]?.message?.content || "{}";
  // 提取 JSON（可能被包裹在 markdown 代码块中）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}");
}

/**
 * 从邮件中提取客户信息
 */
export async function extractClientInfo(
  subject: string,
  body: string
): Promise<ExtractedClientInfo> {
  const prompt = `Extract client information from this photographer inquiry email.
Return ONLY a JSON object with these fields (use null for missing info):
{
  "name": "client's full name",
  "partnerName": "partner/fiancé name if mentioned",
  "weddingDate": "date in YYYY-MM-DD format",
  "eventType": "wedding" | "portrait" | "event" | "other",
  "budget": "mentioned budget or price range",
  "location": "venue or city",
  "referralSource": "how they found the photographer (instagram, google, friend, etc.)"
}

Subject: ${subject}
Body: ${body.slice(0, 2000)}`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}");
}

/**
 * 生成邮件回复草稿
 */
export async function generateReply(
  inquirySubject: string,
  inquiryBody: string,
  extractedInfo: ExtractedClientInfo,
  photographerName: string,
  studioName: string,
  tone: "professional" | "friendly" | "minimal"
): Promise<GeneratedReply> {
  const toneGuide: Record<string, string> = {
    professional: "Warm but polished. Like a luxury service provider. Use full sentences.",
    friendly: "Casual and excited. Like talking to a friend. Use conversational language.",
    minimal: "Brief and to the point. Short sentences. No fluff.",
  };

  const clientName = extractedInfo.name || "there";
  const eventInfo = extractedInfo.weddingDate
    ? `Their wedding date is ${extractedInfo.weddingDate}.`
    : "";

  const prompt = `You are ${photographerName} from ${studioName}, a professional wedding photographer.
Write a reply email to a potential client who just inquired about photography services.

CLIENT INFO:
- Name: ${clientName}
- Event type: ${extractedInfo.eventType || "unknown"}
${eventInfo}
- Location: ${extractedInfo.location || "unknown"}
- Budget: ${extractedInfo.budget || "not specified"}

TONE: ${toneGuide[tone]}

INQUIRY:
Subject: ${inquirySubject}
Body: ${inquiryBody.slice(0, 1500)}

YOUR REPLY MUST:
1. Thank them for reaching out
2. Show enthusiasm for their event
3. Confirm your availability (say you are available on their date if mentioned, otherwise ask for their date)
4. Mention you'll send a personalized proposal with pricing
5. End with a clear next step (e.g., "Would you like to hop on a quick call?")

Return ONLY a JSON object:
{
  "subject": "Re: " + their subject,
  "body": "the full email body in plain text",
  "tone": "${tone}",
  "confidence": 0-100 (how likely this can be sent as-is without human edits)
}`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = response.choices[0]?.message?.content || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = JSON.parse(jsonMatch?.[0] || "{}");

  return {
    subject: result.subject || `Re: ${inquirySubject}`,
    body: result.body || "",
    tone: result.tone || tone,
    confidence: result.confidence || 50,
  };
}
