import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase 中间件
 * 用于刷新 session cookie 和保护路由
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 如果未配置 Supabase，跳过认证检查（本地开发模式）
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 只在需要时检查用户（dashboard 保护、login 跳转）
  const needsAuth = request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname === "/login";
  let user = null;

  if (needsAuth) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // 保护 dashboard 路由
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 试用期/订阅检查（仅 dashboard 路由，排除 settings 页）
  if (isDashboardRoute && user && request.nextUrl.pathname !== "/dashboard/settings") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("trial_ends_at, subscription_status")
      .eq("id", user.id)
      .single();

    const trialEnded = profile?.trial_ends_at && new Date(profile.trial_ends_at) < new Date();
    const hasActiveSub = profile?.subscription_status &&
      ["trialing", "active", "past_due"].includes(profile.subscription_status);

    if (trialEnded && !hasActiveSub) {
      const url = request.nextUrl.clone();
      url.pathname = "/subscribe";
      return NextResponse.redirect(url);
    }
  }

  // 如果已登录，/login 跳转到 /dashboard
  if (request.nextUrl.pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
