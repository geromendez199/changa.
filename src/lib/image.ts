/**
 * Image optimization utilities for responsive, lazy-loaded images
 */

export interface ImageOptimizeOptions {
  width?: number;
  dpr?: number;
  quality?: number;
}

/**
 * Optimize image URL for Unsplash and Supabase Storage
 */
export function optimizeImageUrl(
  url: string,
  options: ImageOptimizeOptions = {}
) {
  if (!url) return url;

  const { width, dpr = 1.5, quality = 75 } = options;
  if (!width) return url;

  // Unsplash images
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    params.set("w", Math.ceil(width * dpr).toString());
    params.set("q", quality.toString());
    params.set("fit", "crop");
    params.set("auto", "format");
    return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
  }

  // Supabase Storage images
  if (url.includes("supabase.co") || url.includes("storage.googleapis.com")) {
    const params = new URLSearchParams();
    params.set("w", Math.ceil(width * dpr).toString());
    params.set("q", quality.toString());
    return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
  }

  // Unknown host - return as-is
  return url;
}

/**
 * Generate srcset string for responsive images
 */
export function buildImageSrcSet(
  url: string,
  widths: number[] = [320, 480, 640, 960, 1280]
) {
  if (!url || !url.includes("unsplash.com")) return "";

  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}
