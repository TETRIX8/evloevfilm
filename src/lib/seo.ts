const ORIGIN = "https://tetrixfilm.ru";
const DEFAULT_TITLE = "TetrixFilm — фильмы, сериалы и аниме онлайн";
const DEFAULT_DESCRIPTION =
  "TetrixFilm — онлайн-каталог фильмов, сериалов, мультфильмов и аниме: поиск, подборки, озвучки и просмотр в хорошем качестве.";

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

function upsertLink(rel: string, href: string) {
  let node = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement("link");
    node.rel = rel;
    document.head.appendChild(node);
  }
  node.href = href;
}

function upsertJsonLd(data: Record<string, unknown>) {
  let node = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld="true"]');
  if (!node) {
    node = document.createElement("script");
    node.type = "application/ld+json";
    node.dataset.seoJsonld = "true";
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
}

export function canonicalForHash(hash = window.location.hash) {
  const clean = hash && hash !== "#" && hash !== "#/" ? hash : "";
  return `${ORIGIN}/${clean ? clean : ""}`;
}

export function setSiteSeo(options: {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  type?: "website" | "video.movie";
  jsonLd?: Record<string, unknown>;
}) {
  const title = options.title || DEFAULT_TITLE;
  const description = options.description || DEFAULT_DESCRIPTION;
  const canonical = options.canonical || canonicalForHash();
  const image = options.image || `${ORIGIN}/og-image.svg`;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("name", "robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  upsertMeta("property", "og:type", options.type || "website");
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", canonical);
  upsertMeta("property", "og:site_name", "TetrixFilm");
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:locale", "ru_RU");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);
  upsertLink("canonical", canonical);
  upsertJsonLd(
    options.jsonLd || {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TetrixFilm",
      url: ORIGIN,
      description,
      inLanguage: "ru-RU",
      potentialAction: {
        "@type": "SearchAction",
        target: `${ORIGIN}/#/search?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  );
}

export { DEFAULT_DESCRIPTION, DEFAULT_TITLE, ORIGIN };
