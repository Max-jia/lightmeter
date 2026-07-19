import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * 自动解决冲突，让类名可以条件化组合
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
