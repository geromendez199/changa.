import { useEffect } from "react";

interface UseDocumentHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

export function useDocumentHead(props: UseDocumentHeadProps) {
  useEffect(() => {
    const {
      title,
      description,
      canonical,
      ogType = "website",
      ogImage,
      jsonLd,
      noindex = false,
    } = props;

    const originalTitle = document.title;
    const originalMeta: { [key: string]: string | null } = {};

    // Title
    if (title) {
      document.title = title;
    }

    // Meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      originalMeta[name] = meta.getAttribute("content");
      meta.setAttribute("content", content);
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      originalMeta[property] = meta.getAttribute("content");
      meta.setAttribute("content", content);
    };

    if (description) {
      updateMeta("description", description);
    }

    if (noindex) {
      updateMeta("robots", "noindex, follow");
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    // OG
    if (ogType) updateProperty("og:type", ogType);
    updateProperty("og:locale", "es_AR");
    if (title) updateProperty("og:title", title);
    if (description) updateProperty("og:description", description);
    if (ogImage) updateProperty("og:image", ogImage);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      originalMeta["canonical"] = link.getAttribute("href");
      link.setAttribute("href", canonical);
    }

    // JSON-LD
    if (jsonLd) {
      const scriptId = "app-json-ld";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (script) script.remove();
      script = document.createElement("script") as HTMLScriptElement;
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
      originalMeta["jsonLd"] = "true";
    }

    // Cleanup
    return () => {
      document.title = originalTitle;
      Object.entries(originalMeta).forEach(([key, value]) => {
        if (key === "canonical") {
          const link = document.querySelector('link[rel="canonical"]');
          if (value) {
            link?.setAttribute("href", value);
          } else {
            link?.remove();
          }
        } else if (key === "jsonLd") {
          document.getElementById("app-json-ld")?.remove();
        } else {
          const meta = document.querySelector(`meta[name="${key}"], meta[property="${key}"]`);
          if (value) {
            meta?.setAttribute("content", value);
          } else {
            meta?.remove();
          }
        }
      });
    };
  }, [props]);
}

export function buildJobPostingJsonLd(job: {
  id: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  created_at?: string;
  salary_range?: { min?: number; max?: number };
}) {
  const datePosted = job.created_at
    ? new Date(job.created_at).toISOString()
    : new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted,
    employmentType: "CONTRACTOR",
    industry: job.category || "Services",
    hiringOrganization: {
      "@type": "Organization",
      name: "changa",
      url: "https://www.changa.blog",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "AR",
        addressRegion: job.location || "Argentina",
      },
    },
    ...(job.salary_range && {
      baseSalary: {
        "@type": "PriceSpecification",
        currency: "ARS",
        ...(job.salary_range.min && {
          priceLow: job.salary_range.min,
        }),
        ...(job.salary_range.max && {
          priceHigh: job.salary_range.max,
        }),
      },
    }),
  };
}
