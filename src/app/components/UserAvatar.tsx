// Image optimization imports removed
/**
 * WHY: Unify avatar presentation across profile, chat, and detail screens so identity cues feel more intentional.
 * CHANGED: YYYY-MM-DD
 */
import { cn } from "./ui/utils";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  fallbackLetter?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "brand" | "surface" | "soft";
  className?: string;
  imageClassName?: string;
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-10 w-10 rounded-2xl text-sm",
  md: "h-14 w-14 rounded-[20px] text-lg",
  lg: "h-20 w-20 rounded-[26px] text-2xl",
  xl: "h-24 w-24 rounded-[30px] text-3xl",
};

const toneClasses: Record<NonNullable<UserAvatarProps["tone"]>, string> = {
  brand:
    "bg-[linear-gradient(135deg,#0DAE79_0%,#0B9A6B_100%)] text-white shadow-[0_16px_32px_rgba(13,174,121,0.18)]",
  surface:
    "border border-white/80 bg-white text-[var(--app-brand)] shadow-[0_16px_32px_rgba(17,24,39,0.12)]",
  soft: "border border-[var(--app-border)] bg-[var(--app-surface-soft)] text-[var(--app-brand)]",
};

export function UserAvatar({
  name,
  avatarUrl,
  fallbackLetter,
  size = "md",
  tone = "brand",
  className,
  imageClassName,
}: UserAvatarProps) {
  const letter = fallbackLetter || name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden font-bold tracking-[-0.03em]",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
      aria-label={name ?? "Avatar"}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ?? "Avatar"}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        <span>{letter}</span>
      )}
    </div>
  );
}
