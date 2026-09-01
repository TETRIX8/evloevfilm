import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type SeoConfig = {
  title: string;
  description: string;
  type?: "website" | "article";
  noindex?: boolean;
};

const SITE_NAME = "EvloevFilm";
const DEFAULT_TITLE = "EvloevFilm — смотреть фильмы и сериалы онлайн";
const DEFAULT_DESCRIPTION =
  "EvloevFilm — удобная онлайн-кинотеатральная платформа: фильмы, сериалы, новинки и аниме на русском языке.";

const PUBLIC_SEO: Record<string, SeoConfig> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/new": {
    title: "Новинки кино и сериалов онлайн — EvloevFilm",
    description:
      "Смотрите новые фильмы и сериалы онлайн на EvloevFilm. Подборка свежих релизов с удобным поиском и навигацией.",
  },
  "/anime": {
    title: "Аниме онлайн на русском — EvloevFilm",
    description:
      "Смотрите аниме онлайн на русском языке в хорошем качестве. Популярные и новые тайтлы собраны в каталоге EvloevFilm.",
  },
  "/about": {
    title: "О EvloevFilm — онлайн-платформа для просмотра кино",
    description:
      "Узнайте больше о EvloevFilm — платформе для поиска и просмотра фильмов, сериалов и аниме онлайн.",
  },
  "/reviews": {
    title: "Отзывы о EvloevFilm — мнения зрителей",
    description:
      "Читайте отзывы зрителей о EvloevFilm и делитесь собственным впечатлением от онлайн-кинотеатра.",
  },
  "/support": {
    title: "Поддержка EvloevFilm",
    description:
      "Свяжитесь с поддержкой EvloevFilm, если у вас возникли вопросы по работе сайта, просмотру или аккаунту.",
  },
};

const NOINDEX_PREFIXES = [
  "/auth",
  "/saved",
  "/history",
  "/profile",
  "/admin",
  "/settings",
  "/anime/anitype/",
];

function getSiteUrl() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  const baseUrl = configuredUrl || window.location.origin;
  return baseUrl.replace(/\/$/, "");
}

function getSeo(pathname: string): SeoConfig {
  if (PUBLIC_SEO[pathname]) return PUBLIC_SEO[pathname];

  if (pathname.startsWith("/movie/")) {
    const movieTitle = decodeURIComponent(pathname.replace("/movie/", "").replace(/\/$/, ""));
    const safeTitle = movieTitle || "фильм";
    return {
      title: `${safeTitle} — смотреть онлайн на EvloevFilm`,
      description: `Смотрите фильм «${safeTitle}» онлайн на EvloevFilm. Откройте страницу фильма и начните просмотр.`,
      type: "article",
    };
  }

  if (pathname.startsWith("/anime/") && !pathname.startsWith("/anime/anitype/")) {
    return {
      title: "Смотреть аниме онлайн — EvloevFilm",
      description:
        "Выберите озвучку и смотрите аниме онлайн на EvloevFilm.",
      type: "article",
    };
  }

  return {
    title: "Страница не найдена — EvloevFilm",
    description: "Запрошенная страница не найдена. Вернитесь в каталог EvloevFilm.",
    noindex: true,
  };
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeo(pathname);
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}${pathname === "/" ? "/" : pathname}`;
    const robots = seo.noindex || NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix))
      ? "noindex, nofollow"
      : "index, follow";

    document.documentElement.lang = "ru";
    document.title = seo.title;
    setMeta("name", "description", seo.description);
    setMeta("name", "robots", robots);
    setMeta("name", "author", SITE_NAME);
    setMeta("property", "og:type", seo.type ?? "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", `${siteUrl}/og-image.png`);
    setMeta("property", "og:locale", "ru_RU");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setMeta("name", "twitter:image", `${siteUrl}/og-image.png`);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let structuredData = document.head.querySelector<HTMLScriptElement>('script[data-seo="structured-data"]');
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.type = "application/ld+json";
      structuredData.dataset.seo = "structured-data";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "ru-RU",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });
  }, [pathname]);

  return null;
}
