import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-shimmer rounded-xl", className)} {...props} />;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-heading font-semibold",
        "bg-[var(--color-gold-subtle)] text-[var(--color-gold)]",
        "ring-1 ring-[var(--color-gold)]/20",
        sizeClasses[size]
      )}
    >
      {initial}
    </div>
  );
}

type BadgeVariant = "default" | "success" | "warning" | "error" | "gold";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]",
    success: "bg-[var(--color-success-bg)] text-[--color-success] border-[--color-success]/20",
    warning: "bg-[var(--color-warning-bg)] text-[--color-warning] border-[--color-warning]/20",
    error: "bg-[var(--color-error-bg)] text-[--color-error] border-[--color-error]/20",
    gold: "bg-[var(--color-gold-subtle)] text-[--color-gold] border-[--color-gold]/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Stat card metric — for dashboard */
export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)] transition-all duration-300 ease-[var(--spring-ios)] hover:-translate-y-1 hover:shadow-[var(--elevation-2)] hover:brightness-105 active:scale-[0.98]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[var(--color-gold-subtle)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--color-gold)]" />
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold tracking-tight">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <TrendIcon className={cn("w-3.5 h-3.5", isPositive ? "text-[var(--color-success)]" : "text-[var(--color-error)]")} />
          <span className={cn("text-xs font-medium", isPositive ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
            {isPositive ? "+" : ""}{change}%
          </span>
          {changeLabel && (
            <span className="text-xs text-[var(--color-text-disabled)] ml-1">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

/** AI Insight card — for bento grid */
export function InsightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--color-gold-subtle)] border border-[var(--color-gold)]/20 shadow-[var(--elevation-1)]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
        <span className="text-sm font-heading font-semibold text-[var(--color-gold)]">{title}</span>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}
