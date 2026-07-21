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
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, plan, trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() } },
  });

  if (signUpError) {
    // 邮箱已注册 → 友好地引导用户去登录
    if (signUpError.message?.includes("already registered") || signUpError.status === 422) {
      return NextResponse.redirect(new URL(`/login?info=${encodeURIComponent("This email is already registered. Please sign in.")}`, request.url), 303);
    }
    // 其他错误 → 带回注册页显示
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(signUpError.message)}`, request.url), 303);
  }

  // 如果 Supabase 开启了邮箱验证，session 为空 → 提醒用户查收邮件
  if (!signUpData.session) {
    return NextResponse.redirect(new URL(`/login?info=${encodeURIComponent("Account created! Please check your email to confirm your address, then sign in.")}`, request.url), 303);
  }

  // 无需邮箱验证，session 已有 → 写 cookie 直接登入
  const res = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  responseCookies.forEach((c: { name: string; value: string; options: Record<string, any> }) => res.cookies.set(c.name, c.value, c.options));
  return res;
}
