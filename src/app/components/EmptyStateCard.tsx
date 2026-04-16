import { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  eyebrow?: string;
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  eyebrow,
  note,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-6 text-center shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
      {eyebrow && (
        <div className="mb-4 inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0DAE79]">
          {eyebrow}
        </div>
      )}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#F0FDF4] text-[#0DAE79] shadow-sm">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-bold text-[#111827]">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-500">{description}</p>
      {note && <p className="mb-4 text-xs font-medium text-gray-400">{note}</p>}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col gap-2">
          {actionLabel && (
            <Button fullWidth onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button fullWidth variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
