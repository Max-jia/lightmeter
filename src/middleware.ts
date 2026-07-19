import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * Next.js 中间件
 *  1. 自动刷新 Supabase session
 *  2. 保护 /dashboard 路由（未登录跳转到 /login）
 *  3. 已登录用户访问 /login 自动跳转到 /dashboard
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 保护所有 dashboard 路由
    "/dashboard/:path*",
    // 登录页面的重定向
    "/login",
    // 排除静态文件和 API
    "/((?!_next/static|_next/image|favicon.ico|api/).)*",
  ],
};
