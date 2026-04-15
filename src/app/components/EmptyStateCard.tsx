import { ReactNode } from "react";

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyStateCard({ icon, title, description, actionLabel, onAction, secondaryActionLabel, onSecondaryAction }: EmptyStateCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-dashed border-gray-200 mx-auto mb-4 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <h3 className="font-bold text-[#111827] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col gap-2">
          {actionLabel && (
            <button onClick={onAction} className="w-full bg-[#10B981] text-white rounded-full py-2.5 text-sm font-semibold">
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && (
            <button onClick={onSecondaryAction} className="w-full bg-[#F8FAFC] text-[#111827] rounded-full py-2.5 text-sm font-semibold border border-gray-200">
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
