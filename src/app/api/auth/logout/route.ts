import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 登出 API
 */
export async function POST(request: Request) {
  const { supabase, responseCookies } = await createClient(true);
  await supabase.auth.signOut();

  const res = NextResponse.redirect(new URL("/login", request.url), 303);
  responseCookies.forEach((c: { name: string; value: string; options: Record<string, any> }) => res.cookies.set(c.name, c.value, c.options));
  return res;
}
