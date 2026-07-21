import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const plan = (formData.get("plan") as string) || "standard";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { supabase, responseCookies } = await createClient(true);

  // 注册
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, plan, trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() } },
  });

  if (signUpError && !signUpError.message?.includes("already registered") && signUpError.status !== 422) {
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(signUpError.message)}`, request.url), 303);
  }

  // 登录
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(signInError.message)}`, request.url), 303);
  }

  const res = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  responseCookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  return res;
}
