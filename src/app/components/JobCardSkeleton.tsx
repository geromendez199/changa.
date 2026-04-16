/**
 * WHY: Reduce blank loading states on marketplace screens with lightweight mobile-first skeleton placeholders.
 * CHANGED: YYYY-MM-DD
 */
interface JobCardSkeletonProps {
  featured?: boolean;
}

export function JobCardSkeleton({ featured = false }: JobCardSkeletonProps) {
  if (featured) {
    return (
      <div className="app-surface min-w-[280px] overflow-hidden lg:min-w-0">
        <div className="app-skeleton h-40" />
        <div className="space-y-3 p-4">
          <div className="app-skeleton h-4 w-24 rounded-full" />
          <div className="app-skeleton h-5 w-4/5 rounded-full" />
          <div className="flex items-center justify-between pt-2">
            <div className="app-skeleton h-4 w-24 rounded-full" />
            <div className="app-skeleton h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="app-skeleton h-24 w-24 rounded-[22px]" />
        <div className="flex-1 space-y-3">
          <div className="app-skeleton h-5 w-3/4 rounded-full" />
          <div className="app-skeleton h-4 w-full rounded-full" />
          <div className="app-skeleton h-4 w-2/3 rounded-full" />
          <div className="flex items-center justify-between pt-1">
            <div className="app-skeleton h-4 w-24 rounded-full" />
            <div className="app-skeleton h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
