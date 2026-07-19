import Stripe from "stripe";

/**
 * Stripe 客户端（服务端）
 * 仅在环境变量配置后才初始化
 */
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  // @ts-ignore
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" as any });
}

export { getStripe as stripe };
