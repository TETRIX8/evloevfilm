import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { bestRating, pool, type Movie } from "./lib/api";
import { useDebounced } from "./lib/hooks";
import { LibraryProvider, rememberMovie, useLibrary } from "./lib/library";
import { ProviderProvider, useProvider } from "./lib/provider-context";
import { loadTrending } from "./lib/queries";
import { navigate, routePath, useRoute, type Route } from "./lib/router";
import { canonicalForHash, setSiteSeo } from "./lib/seo";
import { ApiPage } from "./components/ApiPage";
import { CatalogView } from "./components/CatalogView";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { LibraryView } from "./components/LibraryView";
import { MoviePage } from "./components/MoviePage";
import { Navbar } from "./components/Navbar";
import { SearchView } from "./components/SearchView";
import { Splash } from "./components/Splash";

function Shell() {
  const { provider } = useProvider();
  const { favorites } = useLibrary();
  const route = useRoute();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 380);
  const searching = query.trim().length > 0;

  const [splash, setSplash] = useState<"show" | "leaving" | "gone">("show");
  const [toast, setToast] = useState<string | null>(null);
  const previousProvider = useRef(provider.id);

  const go = useCallback((next: Route) => {
    setQuery("");
    navigate(next);
  }, []);

  const open = useCallback((movie: Movie, play = false) => {
    rememberMovie(movie);
    setQuery("");
    navigate({ name: "movie", provider: movie.provider, id: movie.id, title: movie.title, play });
  }, []);

  const surprise = useCallback(() => {
    const all = [...pool.values()].filter((m) => m.provider === provider.id && m.poster && m.player);
    const good = all.filter((m) => (bestRating(m) ?? 0) >= 6.5);
    const list = good.length ? good : all;
    if (list.length) open(list[Math.floor(Math.random() * list.length)]);
  }, [open, provider.id]);

  // 3D splash: stays until the first screen has its data (and for at least a moment, so the animation is seen)
  useEffect(() => {
    let cancelled = false;
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, 2300));
    const warm =
      route.name === "home" ? loadTrending(provider.id).then(() => undefined, () => undefined) : Promise.resolve();
    const cap = new Promise<void>((resolve) => setTimeout(resolve, 7000));

    Promise.all([minimum, Promise.race([warm, cap])]).then(() => {
      if (cancelled) return;
      setSplash("leaving");
      setTimeout(() => {
        if (!cancelled) setSplash("gone");
      }, 850);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const path = routePath(route);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  useEffect(() => {
    if (route.name === "movie") return;
    const titles: Record<string, string> = {
      home: "TetrixFilm — фильмы, сериалы и аниме онлайн",
      films: "Фильмы онлайн — новинки и лучшие фильмы | TetrixFilm",
      serials: "Сериалы онлайн — лучшие сезоны и новинки | TetrixFilm",
      cartoon: "Мультфильмы онлайн для всей семьи | TetrixFilm",
      "anime-serials": "Аниме онлайн — сериалы и новинки | TetrixFilm",
      library: "Моя коллекция фильмов | TetrixFilm",
      api: "TetrixFilm API — каталог фильмов и сериалов",
    };
    const descriptions: Record<string, string> = {
      home: "TetrixFilm — онлайн-каталог фильмов, сериалов, мультфильмов и аниме: поиск, подборки, озвучки и просмотр в хорошем качестве.",
      films: "Смотрите фильмы онлайн на TetrixFilm: свежие премьеры, популярные новинки, жанры и удобный поиск по каталогу.",
      serials: "Сериалы онлайн на TetrixFilm: новые сезоны, популярные проекты и удобный каталог с описаниями и озвучками.",
      cartoon: "Мультфильмы онлайн для детей и всей семьи: добрые истории, приключения и лучшие анимационные фильмы на TetrixFilm.",
      "anime-serials": "Смотрите аниме онлайн на TetrixFilm: популярные сериалы, новые релизы и удобный поиск по каталогу.",
      library: "Личная коллекция фильмов и сериалов на TetrixFilm — сохраняйте понравившиеся проекты и возвращайтесь к просмотру.",
      api: "Открытый TetrixFilm API для поиска и получения каталога фильмов, сериалов, мультфильмов и аниме.",
    };
    const key = route.name === "catalog" ? route.category : route.name;
    setSiteSeo({
      title: titles[key] || titles.home,
      description: descriptions[key] || descriptions.home,
      canonical: canonicalForHash(),
    });
  }, [route]);

  useEffect(() => {
    if (previousProvider.current === provider.id) return undefined;
    previousProvider.current = provider.id;
    setToast(`Источник данных: ${provider.name}`);
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [provider.id, provider.name]);

  let page: ReactNode;
  if (searching) {
    page = <SearchView key={provider.id} query={query} debounced={debounced} onOpen={open} />;
  } else {
    switch (route.name) {
      case "catalog":
        page = (
          <CatalogView
            key={`${provider.id}:${route.category}:${route.genre ?? ""}`}
            category={route.category}
            genre={route.genre}
            onOpen={open}
            onNavigate={go}
          />
        );
        break;
      case "library":
        page = <LibraryView onOpen={open} onNavigate={go} />;
        break;
      case "api":
        page = <ApiPage onOpen={open} />;
        break;
      case "movie":
        page = <MoviePage key={`${route.provider}:${route.id}`} route={route} onOpen={open} />;
        break;
      default:
        page = <HomePage key={provider.id} onOpen={open} onNavigate={go} onSurprise={surprise} />;
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar route={route} searching={searching} query={query} onQuery={setQuery} onNavigate={go} libraryCount={favorites.length} />
      <main>{page}</main>
      <Footer onNavigate={go} />

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-5" role="status">
          <div className="glass animate-fade-up rounded-full px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div>
        </div>
      )}

      {splash !== "gone" && <Splash leaving={splash === "leaving"} source={provider.name} />}
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <ProviderProvider>
        <Shell />
      </ProviderProvider>
    </LibraryProvider>
  );
}
