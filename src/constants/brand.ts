export const BRAND = {
  appName: "Changa",
  fallbackName: "Changa",
  colors: {
    primary: "#0DAE79",
    primaryHover: "#0B9A6B",
    primaryPressed: "#087A55",
    onPrimary: "#FFFFFF",
    shadowTint: "#0DAE79",
  },
  logos: {
    svg: "/brand/logo.svg",
    png: "/brand/logo.png",
    legacySvg: "/brand/logo-changa.svg",
    legacyPng: "/brand/logo-changa.png",
  },
} as const;

export const BRAND_LOGO_CANDIDATES = [BRAND.logos.svg, BRAND.logos.png, BRAND.logos.legacySvg, BRAND.logos.legacyPng] as const;
