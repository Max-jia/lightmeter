import { createServerClient } from "@supabase/ssr";
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

  // 用能写 cookie 的 supabase client
  const supabaseResponse = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookiePairs = request.headers.get("cookie")?.split("; ") || [];
          return cookiePairs.map((pair) => {
            const [name, ...rest] = pair.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 先注册
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

  // 如果已注册，忽略错误继续登录
  if (signUpError && !signUpError.message?.includes("already registered") && signUpError.status !== 422) {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(signUpError.message)}`, request.url),
      303
    );
  }

  // 登录 → session cookie 写入 supabaseResponse
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(signInError.message)}`, request.url),
      303
    );
  }

  return supabaseResponse;
}
