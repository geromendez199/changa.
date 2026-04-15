import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  icon,
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#0DAE79] text-white shadow-lg shadow-[#0DAE79]/25 hover:bg-[#0B9A6B] active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed",
    secondary: "bg-[#F8FAFC] text-[#111827] border border-gray-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "bg-transparent text-[#0DAE79] border-2 border-[#0DAE79] hover:bg-[#0DAE79]/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
