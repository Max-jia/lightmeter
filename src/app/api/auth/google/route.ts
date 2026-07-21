import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Google OAuth 登录入口
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  // 强制使用线上域名（Vercel 环境下 request.url 可能不准）
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/api/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, baseUrl),
      303
    );
  }

  return NextResponse.redirect(data.url);
}
