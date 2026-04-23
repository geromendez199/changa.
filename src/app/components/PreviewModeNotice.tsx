/**
 * WHY: Make local preview mode explicit so sample data feels intentional instead of pretending to be live production activity.
 * CHANGED: YYYY-MM-DD
 */
import { Eye, ServerCog } from "lucide-react";
import { SurfaceCard } from "./SurfaceCard";
import { cn } from "./ui/utils";

interface PreviewModeNoticeProps {
  title?: string;
  description: string;
  className?: string;
  compact?: boolean;
}

export function PreviewModeNotice({
  title = "Modo de prueba",
  description,
  className,
  compact = false,
}: PreviewModeNoticeProps) {
  return (
    <SurfaceCard
      tone="soft"
      padding={compact ? "sm" : "md"}
      className={cn("border border-[rgba(13,174,121,0.14)] shadow-none", className)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--app-brand)]">
          {compact ? <Eye size={18} /> : <ServerCog size={18} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--app-text)]">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--app-text-muted)]">
            {description}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
