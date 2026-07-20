import { google } from "googleapis";

/**
 * 自动刷新 Gmail access token
 * 调用 Gmail API 前先检查 token 是否过期，过期则用 refresh_token 换新的
 */
export async function getValidAccessToken(
  accessToken: string,
  refreshToken: string | null,
  userId: string
): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
  });

  // 检查 token 是否过期
  const expiryDate = oauth2Client.credentials.expiry_date;
  if (!expiryDate || Date.now() >= expiryDate - 60000) {
    // Token 已过期或即将过期 → 刷新
    if (!refreshToken) {
      throw new Error("No refresh token available. Please reconnect Gmail.");
    }

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      const newAccessToken = credentials.access_token!;
      const newExpiry = credentials.expiry_date!;

      // 更新数据库中的 token
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      await supabase
        .from("gmail_tokens")
        .update({
          access_token: newAccessToken,
          expires_at: new Date(newExpiry).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return newAccessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      throw new Error("Gmail token refresh failed. Please reconnect Gmail.");
    }
  }

  return accessToken;
}

export function createGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * 获取最近的未读邮件（用于初始同步）
 */
export async function fetchRecentEmails(accessToken: string, maxResults = 20) {
  const gmail = createGmailClient(accessToken);

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox -category:promotions -category:social",
    maxResults,
  });

  const messages = listResponse.data.messages || [];
  const emails = [];

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const headers = detail.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const date = headers.find((h) => h.name === "Date")?.value || "";

    let body = "";
    if (detail.data.payload?.body?.data) {
      body = Buffer.from(detail.data.payload.body.data, "base64").toString("utf-8");
    } else if (detail.data.payload?.parts) {
      for (const part of detail.data.payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf-8");
          break;
        }
      }
    }

    emails.push({
      gmailId: msg.id!,
      threadId: detail.data.threadId,
      subject,
      from,
      date,
      body: body.slice(0, 5000),
      snippet: detail.data.snippet || "",
    });
  }

  return emails;
}

/**
 * 发送邮件
 */
export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
) {
  const gmail = createGmailClient(accessToken);

  const email = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=UTF-8",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const encoded = Buffer.from(email).toString("base64url");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });

  return response.data;
}
