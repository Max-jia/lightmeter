import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=no_code`, baseUrl), 303);
  }

  const { supabase, responseCookies } = await createClient(true);

  try {
    await supabase.auth.exchangeCodeForSession(code);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, baseUrl), 303);
  }

  const res = NextResponse.redirect(new URL("/dashboard", baseUrl), 303);
  responseCookies.forEach((c: { name: string; value: string; options: Record<string, any> }) => res.cookies.set(c.name, c.value, c.options));
  return res;
}
