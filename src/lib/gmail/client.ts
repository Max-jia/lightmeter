import { google } from "googleapis";

/**
 * Gmail API 客户端
 * 使用 OAuth 2.0 访问用户的 Gmail
 */
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

    // 获取邮件正文
    let body = "";
    if (detail.data.payload?.body?.data) {
      body = Buffer.from(detail.data.payload.body.data, "base64").toString(
        "utf-8"
      );
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
      body: body.slice(0, 5000), // 限制长度
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
    requestBody: {
      raw: encoded,
    },
  });

  return response.data;
}
