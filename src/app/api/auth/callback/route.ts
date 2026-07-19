import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Supabase OAuth 回调
 * Google 授权后 Supabase 跳回这里，我们交换 code 换 session
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("No authorization code received")}`, baseUrl),
      303
    );
  }

  try {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message)}`, baseUrl),
      303
    );
  }

  return NextResponse.redirect(new URL("/dashboard", baseUrl), 303);
}
