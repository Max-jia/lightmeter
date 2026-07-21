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

  const supabase = await createClient();

  // 注册用户
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        plan: plan,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  });

  if (signUpError) {
    // 已注册 → 直接登录
    if (signUpError.message?.includes("already registered") || signUpError.status === 422) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) {
        return NextResponse.redirect(new URL("/dashboard", request.url), 303);
      }
    }
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(signUpError.message)}`, request.url),
      303
    );
  }

  // 注册成功后立即登录
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
