import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Gmail OAuth 回调
 * Google 授权后跳回这里，用 code 换 access_token 并存入数据库
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user_id
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?gmail_error=" + (error || "no_code"), request.url)
    );
  }

  const supabase = await createClient();

  try {
    // 用 code 换 token
    const redirectUri = `${new URL(request.url).origin}/api/gmail/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || tokens.error) {
      console.error("Token exchange failed:", tokens);
      return NextResponse.redirect(
        new URL("/dashboard/settings?gmail_error=token_exchange_failed", request.url)
      );
    }

    // 存储 token 到数据库
    const { error: dbError } = await supabase
      .from("gmail_tokens")
      .upsert({
        user_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Failed to save gmail token:", dbError);
      return NextResponse.redirect(
        new URL("/dashboard/settings?gmail_error=db_save_failed", request.url)
      );
    }

  } catch (err) {
    console.error("Gmail callback error:", err);
    return NextResponse.redirect(
      new URL("/dashboard/settings?gmail_error=unexpected", request.url)
    );
  }

  return NextResponse.redirect(new URL("/dashboard/inbox?gmail=connected", request.url));
}
