import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, prefix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-disabled)]">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-3.5 py-2.5 text-sm rounded-xl border",
              "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
              "border-[var(--color-border-default)]",
              "placeholder:text-[var(--color-text-disabled)]",
              "focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-glow)]",
              "transition-all duration-[var(--duration-fast)] ease-[var(--spring-smooth)]",
              prefix && "pl-9",
              error &&
                "!border-[var(--color-error)] focus:!border-[var(--color-error)] focus:!ring-red-900/30",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--color-text-disabled)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
