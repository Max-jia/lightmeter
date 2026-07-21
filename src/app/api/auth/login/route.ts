import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { supabase, responseCookies } = await createClient(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url), 303);
  }

  const res = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  responseCookies.forEach((c: { name: string; value: string; options: Record<string, any> }) => res.cookies.set(c.name, c.value, c.options));
  return res;
}
