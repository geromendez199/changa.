export const BRAND = {
  appName: "Changa",
  colors: {
    primary: "#0DAE79",
    primaryHover: "#0B9A6B",
    primaryPressed: "#087A55",
    onPrimary: "#FFFFFF",
    shadowTint: "#0DAE79",
  },
  logos: {
    svg: "/brand/logo-changa.svg",
    png: "/brand/logo-changa.png",
  },
} as const;

export const BRAND_LOGO_CANDIDATES = [BRAND.logos.svg, BRAND.logos.png] as const;
