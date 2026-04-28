import { optimizeImageUrl, buildImageSrcSet } from '@/lib/image';
/**
 * WHY: Make job cards feel more premium and scannable with calmer surfaces, clearer metadata, and standardized status chips.
 * CHANGED: YYYY-MM-DD
 */
import { MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "./Badge";
import { ListingType } from "../../types/domain";
import { getListingTypeLabel } from "../utils/listings";

interface JobCardProps {
  id: string;
  listingType: ListingType;
  image: string;
  title: string;
  category: string;
  price: string;
  rating: number;
  distance: string;
  featured?: boolean;
  urgency?: string;
  description?: string;
  testId?: string;
}

export function JobCard({
  id,
  listingType,
  image,
  title,
  category,
  price,
  rating,
  distance,
  featured = false,
  urgency,
  description,
  testId,
}: JobCardProps) {
  const navigate = useNavigate();
  const listingLabel = getListingTypeLabel(listingType);

  if (featured) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/job/${id}`)}
        data-testid={testId}
        className="app-surface min-w-[min(18rem,82vw)] cursor-pointer overflow-hidden text-left transition-[transform,box-shadow] duration-200 hover:translate-y-[-2px] hover:shadow-[var(--app-shadow-md)] lg:min-w-0"
      >
        <div className="relative">
          <img src={image} alt={title} className="h-40 w-full object-cover" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant="published" size="sm">
              {listingLabel}
            </Badge>
            <Badge variant="accent" size="sm">
              {category}
            </Badge>
          </div>
          {urgency && (
            <div className="absolute top-3 left-3">
              <Badge variant="urgent" size="sm">
                {urgency}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-3 line-clamp-2 text-base font-bold leading-snug tracking-normal text-[var(--app-text)]">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-[var(--app-text-muted)]">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" />
                <span className="font-semibold text-[var(--app-text)]">{rating}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-[#c7d1cb]" />
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-[#94a39b]" />
                <span>{distance}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-[var(--app-border)] pt-3">
            <span className="text-lg font-bold tracking-normal text-[var(--app-brand)]">
              {price}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(`/job/${id}`)}
      data-testid={testId}
      className="app-surface cursor-pointer overflow-hidden text-left transition-[transform,box-shadow] duration-200 hover:translate-y-[-2px] hover:shadow-[var(--app-shadow-md)]"
    >
      <div className="flex gap-3 p-3 min-[380px]:gap-4 min-[380px]:p-4">
        <div className="relative flex-shrink-0">
          <img src={image} alt={title} className="h-20 w-20 rounded-[18px] object-cover min-[380px]:h-24 min-[380px]:w-24 min-[380px]:rounded-[22px]" />
          {urgency && (
            <div className="absolute -top-1 -right-1">
              <div className="rounded-full bg-[var(--app-danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--app-danger-text)]">
                {urgency}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="line-clamp-2 text-sm font-bold tracking-normal text-[var(--app-text)] min-[380px]:text-base">
              {title}
            </h3>
          </div>
          {description && (
            <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
              {description}
            </p>
          )}
          <div className="mt-auto">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 min-[380px]:gap-2">
              <Badge variant="published" size="sm">
                {listingLabel}
              </Badge>
              <Badge variant="accent" size="sm">
                {category}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--app-text-muted)]">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="font-semibold text-[var(--app-text)]">{rating}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-[#c7d1cb]" />
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#94a39b]" />
                  <span>{distance}</span>
                </div>
              </div>
              <span className="text-sm font-bold tracking-normal text-[var(--app-brand)] min-[380px]:text-base">
                {price}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
