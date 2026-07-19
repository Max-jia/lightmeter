import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Google OAuth 登录入口
 * 支持 POST (表单提交) 和 GET (链接点击)
 */
export async function GET(request: Request) {
  return handleGoogleAuth(request);
}
export async function POST(request: Request) {
  return handleGoogleAuth(request);
}

async function handleGoogleAuth(request: Request) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      303
    );
  }

  return NextResponse.redirect(data.url);
}
