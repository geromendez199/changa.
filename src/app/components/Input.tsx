/**
 * WHY: Make text inputs feel consistent, calmer, and more premium across auth, search, publish, and profile flows.
 * CHANGED: YYYY-MM-DD
 */
import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "./ui/utils";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: ReactNode;
  type?: string;
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  size?: "md" | "lg";
}

export function Input({
  placeholder,
  value,
  onChange,
  icon,
  type = "text",
  label,
  hint,
  error,
  containerClassName,
  inputClassName,
  size = "md",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const ariaLabel = props["aria-label"] ?? label ?? placeholder;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[var(--app-text)]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a39b]">
            {icon}
          </div>
        ) : null}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          aria-label={ariaLabel}
          className={cn(
            "app-field px-4 text-[15px]",
            size === "lg" ? "min-h-[var(--app-control-height-lg)]" : "min-h-[var(--app-control-height-md)]",
            icon && "pl-12",
            error && "border-[var(--app-danger-text)] ring-4 ring-red-500/10",
            inputClassName,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-sm font-medium text-[var(--app-danger-text)]">{error}</p>
      ) : hint ? (
        <p className="text-sm text-[var(--app-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
