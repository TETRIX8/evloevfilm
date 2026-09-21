import { useEffect } from "react";

const SITE_URL = "https://evloevfilm.vercel.app";
const DEFAULT_TITLE = "EVLOEVFILM — фильмы, сериалы и аниме онлайн";
const DEFAULT_DESCRIPTION = "Находите фильмы, сериалы и аниме по названию или настроению. Новинки, популярное, подборки и AI-рекомендации на EVLOEVFILM.";

type SEOProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "video.movie";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function SEO({ title, description = DEFAULT_DESCRIPTION, path = "/", image = `${SITE_URL}/og-image.svg`, type = "website", noindex = false, jsonLd }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | EVLOEVFILM` : DEFAULT_TITLE;
    const canonical = `${SITE_URL}${path}`;
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:site_name", "EVLOEVFILM");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertLink("canonical", canonical);

    const scriptId = "evloevfilm-jsonld";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd || {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "EVLOEVFILM",
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/?q={search_term_string}`, "query-input": "required name=search_term_string" },
    });
    document.head.appendChild(script);
  }, [description, image, jsonLd, noindex, path, title, type]);

  return null;
}

export { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL };
