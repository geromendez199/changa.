/**
 * WHY: Standardize CTA hierarchy, sizing, and interaction states across the mobile product.
 * CHANGED: YYYY-MM-DD
 */
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./ui/utils";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  icon,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0DAE79]/12 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]";

  const variants = {
    primary:
      "bg-[var(--app-brand)] text-white shadow-[0_16px_30px_rgba(13,174,121,0.22)] hover:bg-[var(--app-brand-strong)]",
    secondary:
      "border border-[var(--app-border)] bg-white text-[var(--app-text)] shadow-[0_8px_20px_rgba(17,24,39,0.04)] hover:bg-[var(--app-surface-muted)]",
    outline:
      "border border-[var(--app-border-strong)] bg-transparent text-[var(--app-brand)] hover:border-[var(--app-brand)] hover:bg-[var(--app-brand-soft)]",
    ghost: "bg-transparent text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]",
    soft: "bg-[var(--app-brand-soft)] text-[var(--app-brand)] hover:bg-[#ddf8eb]",
    danger:
      "bg-[var(--app-danger-soft)] text-[var(--app-danger-text)] border border-red-100 hover:bg-red-100",
  };

  const sizes = {
    sm: "min-h-9 px-3.5 text-sm sm:min-h-10 sm:px-4",
    md: "min-h-[46px] px-4 text-[14px] sm:min-h-[50px] sm:px-5 sm:text-[15px] lg:min-h-[46px] lg:px-4 lg:text-[14px]",
    lg: "min-h-[50px] px-5 text-[15px] sm:min-h-[54px] sm:px-6 sm:text-base lg:min-h-[48px] lg:px-5 lg:text-[15px]",
    icon: "h-10 w-10 p-0 sm:h-11 sm:w-11",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
