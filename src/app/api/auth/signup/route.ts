import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 邮箱密码注册 API
 * 注册后跳转到付费墙（Stripe Checkout）
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const plan = (formData.get("plan") as string) || "standard";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
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

  if (error) {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(error.message)}`, request.url),
      303
    );
  }

  // 注册成功 → 跳转到付费墙
  return NextResponse.redirect(new URL(`/subscribe?plan=${plan}`, request.url), 303);
}
