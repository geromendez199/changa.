import { writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.SITE_URL || "https://www.changa.blog";

// Static routes
const staticRoutes = [
  "/",
  "/home",
  "/search",
  "/login",
  "/signup",
];

// Generate XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map((route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${route === "/" ? "weekly" : "daily"}</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;

const outputPath = join(process.cwd(), "public", "sitemap.xml");
writeFileSync(outputPath, sitemap);
console.log(`✅ Sitemap generated: ${outputPath}`);
