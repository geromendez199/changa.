/**
 * WHY: Give screen sections a single typography and action pattern so hierarchy feels consistent and easy to scan.
 * CHANGED: YYYY-MM-DD
 */
import { type ReactNode } from "react";
import { cn } from "./ui/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-end min-[380px]:justify-between min-[380px]:gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-normal text-[var(--app-text)]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-relaxed text-[var(--app-text-muted)]">{subtitle}</p>
        ) : null}
      </div>

      {action ?? (actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="inline-flex min-h-9 shrink-0 items-center rounded-full px-2 text-sm font-semibold text-[var(--app-brand)] transition-colors hover:text-[var(--app-brand-strong)] min-[380px]:min-h-10"
        >
          {actionLabel}
        </button>
      ) : null)}
    </div>
  );
}
