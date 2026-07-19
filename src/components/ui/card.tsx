import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  depth?: 0 | 1 | 2 | 3;
  glass?: boolean;
  gradient?: boolean;
  goldBorder?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      depth = 1,
      glass,
      gradient,
      goldBorder,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          // 层级深度
          glass
            ? "glass"
            : gradient
            ? "gradient-card border border-[var(--color-border-subtle)]"
            : "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
          depth === 0 && "",
          depth === 1 && "shadow-[var(--elevation-1)]",
          depth === 2 && "shadow-[var(--elevation-2)]",
          depth === 3 && "shadow-[var(--elevation-3)]",
          // 金色边框
          goldBorder && "!border-[var(--color-gold)]/30",
          // 悬停效果
          "transition-all duration-[var(--duration-normal)] ease-[var(--spring-smooth)]",
          "hover:shadow-[var(--elevation-2)] hover:border-[var(--color-border-default)]",
          goldBorder && "hover:!border-[var(--color-gold)]/50",
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export { Card };
