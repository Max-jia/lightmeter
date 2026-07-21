import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Google OAuth 登录入口
 */
export async function GET(request: Request) {
  const { supabase, responseCookies } = await createClient(true);
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

  // PKCE code_verifier cookie 必须写回浏览器，callback 才能完成 session 交换
  const res = NextResponse.redirect(data.url);
  responseCookies.forEach((c: { name: string; value: string; options: Record<string, any> }) => res.cookies.set(c.name, c.value, c.options));
  return res;
}
