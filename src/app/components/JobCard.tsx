import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "./Badge";

interface JobCardProps {
  id: string;
  image: string;
  title: string;
  category: string;
  price: string;
  rating: number;
  distance: string;
  featured?: boolean;
  urgency?: string;
  description?: string;
}

export function JobCard({
  id,
  image,
  title,
  category,
  price,
  rating,
  distance,
  featured = false,
  urgency,
  description,
}: JobCardProps) {
  const navigate = useNavigate();

  if (featured) {
    return (
      <div
        onClick={() => navigate(`/job/${id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer min-w-[280px] border border-gray-100"
      >
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="default">{category}</Badge>
          </div>
          {urgency && (
            <div className="absolute top-3 left-3">
              <Badge variant="error">{urgency}</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#111827] text-base mb-3 line-clamp-2 leading-snug">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" />
                <span className="font-medium text-gray-700">{rating}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-400" />
                <span>{distance}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-[#0DAE79] font-bold text-lg">{price}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/job/${id}`)}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
    >
      <div className="flex gap-4 p-4">
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-24 h-24 object-cover rounded-2xl"
          />
          {urgency && (
            <div className="absolute -top-1 -right-1">
              <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                {urgency}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[#111827] line-clamp-1 text-base">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="font-medium text-gray-700">{rating}</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400" />
                  <span>{distance}</span>
                </div>
              </div>
              <span className="text-[#0DAE79] font-bold text-base">{price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
