import { useMemo, useState } from "react";
import { BRAND, BRAND_LOGO_CANDIDATES } from "../../constants/brand";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
}

export function BrandLogo({
  className = "",
  imageClassName = "h-12 w-auto",
  fallbackClassName = "text-3xl font-bold tracking-tight",
  alt,
}: BrandLogoProps) {
  const [logoIndex, setLogoIndex] = useState(0);

  const logoSrc = useMemo(() => BRAND_LOGO_CANDIDATES[logoIndex], [logoIndex]);

  if (!logoSrc) {
    return <span className={fallbackClassName}>{BRAND.fallbackName}</span>;
  }

  return (
    <div className={className}>
      <img
        src={logoSrc}
        alt={alt ?? BRAND.appName}
        className={imageClassName}
        onError={() => setLogoIndex((current) => current + 1)}
      />
    </div>
  );
}
