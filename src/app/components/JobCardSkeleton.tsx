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
      <div className="min-w-[280px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="h-40 animate-pulse bg-gray-100" />
        <div className="space-y-3 p-4">
          <div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="h-5 w-4/5 animate-pulse rounded-full bg-gray-100" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="flex gap-4 p-4">
        <div className="h-24 w-24 animate-pulse rounded-2xl bg-gray-100" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-gray-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-100" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
