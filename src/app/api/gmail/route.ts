import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Gmail OAuth 连接入口
 * 重定向用户到 Google 授权页面
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${baseUrl}/api/gmail/callback`;
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ];

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", data.user.id);

  return NextResponse.redirect(authUrl.toString());
}
