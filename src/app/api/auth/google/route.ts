import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Google OAuth 登录入口
 */
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, baseUrl),
        303
      );
    }

    return NextResponse.redirect(data.url);
  } catch (err: any) {
    console.error("Google OAuth exception:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err?.message || "OAuth failed")}`, baseUrl),
      303
    );
  }
}
