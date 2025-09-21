import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/navigation/Navigation";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { AnimeGridNew } from "@/components/anime/AnimeGridNew";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchAnimeList, 
  searchAnime, 
  getAnimeByGenres, 
  getTopAnime,
  KodikAnimeItem 
} from "@/services/kodik-api";
import {
  getAnimeInRotate,
  searchAnimeByKeyword,
  getTopRatedAnime,
  getRecentAnime,
  getOngoingAnime,
  getAnimeSelections,
  AnimeSearchItem,
  AnimeSelection
} from "@/services/anitype-api";
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Filter,
  Search,
  RefreshCw,
  Heart,
  Zap,
  Crown,
  Flame,
  Clock,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

const POPULAR_GENRES = [
  "экшен", "приключения", "комедия", "драма", "фантастика", 
  "романтика", "фэнтези", "триллер", "мистика", "школа"
];

export default function Anime() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [useNewApi, setUseNewApi] = useState(false); // По умолчанию используем старое API

  // AniType API queries - новое API
  const { data: rotateAnime, isLoading: isLoadingRotate, refetch: refetchRotate } = useQuery({
    queryKey: ["anitype-rotate"],
    queryFn: getAnimeInRotate,
    enabled: useNewApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: topRatedAnime, isLoading: isLoadingTopRated, refetch: refetchTopRated } = useQuery({
    queryKey: ["anitype-top-rated"],
    queryFn: () => getTopRatedAnime(24),
    enabled: useNewApi,
    staleTime: 10 * 60 * 1000,
  });

  const { data: recentAnime, isLoading: isLoadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ["anitype-recent"],
    queryFn: () => getRecentAnime(24),
    enabled: useNewApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: ongoingAnime, isLoading: isLoadingOngoing, refetch: refetchOngoing } = useQuery({
    queryKey: ["anitype-ongoing"],
    queryFn: () => getOngoingAnime(24),
    enabled: useNewApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: animeSelections, isLoading: isLoadingSelections, refetch: refetchSelections } = useQuery({
    queryKey: ["anitype-selections"],
    queryFn: () => getAnimeSelections(0, 6),
    enabled: useNewApi,
    staleTime: 15 * 60 * 1000,
  });

  // AniType search query
  const { data: anitypeSearchResults, isLoading: isLoadingAnitypeSearch } = useQuery({
    queryKey: ["anitype-search", searchTerm],
    queryFn: () => searchAnimeByKeyword(searchTerm, 20, 0),
    enabled: searchTerm.length > 0 && useNewApi,
  });

  // Старые запросы для совместимости
  const { data: latestAnime, isLoading: isLoadingLatest, refetch: refetchLatest } = useQuery({
    queryKey: ["latest-anime"],
    queryFn: () => fetchAnimeList(30),
    enabled: !useNewApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: topAnime, isLoading: isLoadingTop, refetch: refetchTop } = useQuery({
    queryKey: ["top-anime"],
    queryFn: () => getTopAnime(24),
    enabled: !useNewApi,
    staleTime: 10 * 60 * 1000,
  });

  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ["search-anime", searchTerm],
    queryFn: () => searchAnime(searchTerm),
    enabled: searchTerm.length > 0 && !useNewApi,
  });

  const { data: genreAnime, isLoading: isLoadingGenre } = useQuery({
    queryKey: ["genre-anime", selectedGenre],
    queryFn: () => getAnimeByGenres([selectedGenre!]),
    enabled: selectedGenre !== null && !useNewApi,
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(term.length > 0);
    if (term.length > 0) {
      setSelectedGenre(null);
    }
  };

  const handleGenreSelect = (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genre);
      setSearchTerm("");
      setIsSearching(false);
    }
  };

  const handleRefresh = () => {
    if (useNewApi) {
      refetchRotate();
      refetchTopRated();
      refetchRecent();
      refetchOngoing();
      refetchSelections();
    } else {
      refetchLatest();
      refetchTop();
    }
    toast.success("Данные обновлены!");
  };

  const toggleApi = () => {
    setUseNewApi(!useNewApi);
    setSearchTerm("");
    setSelectedGenre(null);
    setIsSearching(false);
    toast.info(`Переключено на ${!useNewApi ? 'новое' : 'старое'} API`);
  };

  // Determine which data to show
  const getDisplayData = (): { 
    data: (KodikAnimeItem[] | AnimeSearchItem[]) | undefined; 
    isLoading: boolean; 
    title: string; 
    icon: React.ReactNode;
    isNewApi: boolean;
  } => {
    if (isSearching && searchTerm) {
      if (useNewApi) {
        return {
          data: anitypeSearchResults,
          isLoading: isLoadingAnitypeSearch,
          title: `Результаты поиска: "${searchTerm}"`,
          icon: <Search className="h-5 w-5" />,
          isNewApi: true
        };
      } else {
        return {
          data: searchResults?.results,
          isLoading: isLoadingSearch,
          title: `Результаты поиска: "${searchTerm}"`,
          icon: <Search className="h-5 w-5" />,
          isNewApi: false
        };
      }
    }
    
    if (selectedGenre && !useNewApi) {
      return {
        data: genreAnime?.results,
        isLoading: isLoadingGenre,
        title: `Жанр: ${selectedGenre}`,
        icon: <Filter className="h-5 w-5" />,
        isNewApi: false
      };
    }
    
    return {
      data: undefined,
      isLoading: false,
      title: "",
      icon: null,
      isNewApi: useNewApi
    };
  };

  const displayInfo = getDisplayData();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90"
    >
      <Navigation />
      
      <main className="container mx-auto pt-24 pb-16 px-4 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="space-y-4">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Аниме Мир
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Откройте для себя лучшие аниме с высоким качеством и удобным просмотром
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Поиск аниме по названию..."
              className="h-14 text-lg"
            />
          </motion.div>

          {/* Genre Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Популярные жанры:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_GENRES.map((genre, index) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                >
                  <Button
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGenreSelect(genre)}
                    className="capitalize hover:scale-105 transition-all duration-200"
                  >
                    {genre}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Control Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex gap-3 justify-center"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="gap-2 hover:scale-105 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить данные
            </Button>
            
            <Button
              variant={useNewApi ? "default" : "outline"}
              size="sm"
              onClick={toggleApi}
              className="gap-2 hover:scale-105 transition-all"
              title={useNewApi ? 'Переключить на старое API (Kodik)' : 'Переключить на новое API (AniType) - экспериментально'}
            >
              <Zap className="h-4 w-4" />
              {useNewApi ? 'Новое API' : 'Старое API'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {displayInfo.data ? (
            <motion.div
              key="filtered-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-r from-primary/10 via-purple-400/10 to-pink-400/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {displayInfo.icon}
                    {displayInfo.title}
                    {displayInfo.data && (
                      <Badge variant="secondary" className="ml-auto">
                        {displayInfo.data.length} результатов
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              {displayInfo.isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : displayInfo.data && displayInfo.data.length > 0 ? (
                displayInfo.isNewApi ? (
                  <AnimeGridNew animes={displayInfo.data as AnimeSearchItem[]} />
                ) : (
                  <AnimeGrid animes={displayInfo.data as KodikAnimeItem[]} />
                )
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {isSearching ? "По вашему запросу ничего не найдено" : "Аниме не найдено"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {useNewApi ? (
                <Tabs defaultValue="rotate" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto h-12">
                    <TabsTrigger value="rotate" className="gap-2">
                      <Flame className="h-4 w-4" />
                      В ротации
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Новинки
                    </TabsTrigger>
                    <TabsTrigger value="ongoing" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Онгоинги
                    </TabsTrigger>
                    <TabsTrigger value="top" className="gap-2">
                      <Crown className="h-4 w-4" />
                      Топ рейтинг
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="rotate" className="space-y-6">
                    <Card className="bg-gradient-to-r from-red-500/10 via-orange-400/10 to-yellow-400/10 border-red-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Flame className="h-6 w-6 text-red-400" />
                          В ротации
                          <Badge variant="secondary" className="ml-auto bg-red-500/20 text-red-300">
                            Рекомендуем
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {isLoadingRotate ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : rotateAnime && rotateAnime.length > 0 ? (
                      <AnimeGridNew animes={rotateAnime.map(item => ({
                        id: item.id,
                        titles: {
                          ID: 0,
                          original: item.title || 'Без названия',
                          russian: item.russian || item.title || 'Без названия',
                          english: '',
                          japanese: '',
                          russian_alternative: '',
                          russian_kp: ''
                        },
                        description: item.description || '',
                        kind: item.kind as any,
                        score: parseFloat(item.score) || 0,
                        status: item.status,
                        rating: item.rating,
                        episodes: item.episodes,
                        episodes_aired: item.episodes_aired,
                        episode_duration: item.duration,
                        aired_on: item.aired_on,
                        released_on: item.released_on,
                        season: '',
                        poster: item.image.original,
                        genres: item.genres,
                        studios: item.studios,
                        countries: '',
                        licensors: '',
                        mod: 0,
                        banned: '',
                        in_rotate: true,
                        uhd: false,
                        qhd: false,
                        horizontal_poster: '',
                        creditless_poster: '',
                        logotype: '',
                        logotype_alt: '',
                        season_number: 1,
                        kp_id: 0
                      })) as AnimeSearchItem[]} />
                    ) : null}
                  </TabsContent>

                  <TabsContent value="recent" className="space-y-6">
                    <Card className="bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-teal-400/10 border-blue-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Sparkles className="h-6 w-6 text-blue-400" />
                          Последние новинки
                          <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-300">
                            Свежие
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {isLoadingRecent ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : recentAnime && recentAnime.length > 0 ? (
                      <AnimeGridNew animes={recentAnime} />
                    ) : null}
                  </TabsContent>

                  <TabsContent value="ongoing" className="space-y-6">
                    <Card className="bg-gradient-to-r from-green-500/10 via-emerald-400/10 to-teal-400/10 border-green-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Clock className="h-6 w-6 text-green-400" />
                          Онгоинги
                          <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-300">
                            Выходят
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {isLoadingOngoing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : ongoingAnime && ongoingAnime.length > 0 ? (
                      <AnimeGridNew animes={ongoingAnime} />
                    ) : null}
                  </TabsContent>

                  <TabsContent value="top" className="space-y-6">
                    <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-400/10 to-red-400/10 border-yellow-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                          Лучшие по рейтингу
                          <Badge variant="secondary" className="ml-auto bg-yellow-500/20 text-yellow-300">
                            Высокие оценки
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {isLoadingTopRated ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : topRatedAnime && topRatedAnime.length > 0 ? (
                      <AnimeGridNew animes={topRatedAnime} />
                    ) : null}
                  </TabsContent>
                </Tabs>
              ) : (
                <Tabs defaultValue="latest" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12">
                    <TabsTrigger value="latest" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Новинки
                    </TabsTrigger>
                    <TabsTrigger value="top" className="gap-2">
                      <Crown className="h-4 w-4" />
                      Топ рейтинг
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="latest" className="space-y-6">
                    <Card className="bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-teal-400/10 border-blue-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Zap className="h-6 w-6 text-blue-400" />
                          Последние обновления
                          <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-300">
                            Свежие серии
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {isLoadingLatest ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : latestAnime?.results ? (
                      <AnimeGrid animes={latestAnime.results} />
                    ) : null}
                  </TabsContent>

                  <TabsContent value="top" className="space-y-6">
                    <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-400/10 to-red-400/10 border-yellow-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                          Лучшие по рейтингу
                          <Badge variant="secondary" className="ml-auto bg-yellow-500/20 text-yellow-300">
                            Высокие оценки
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {isLoadingTop ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : topAnime?.results ? (
                      <AnimeGrid animes={topAnime.results} />
                    ) : null}
                  </TabsContent>
                </Tabs>
              )}
              
              {/* Подборки аниме (только для нового API) */}
              {useNewApi && animeSelections && animeSelections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  <Card className="bg-gradient-to-r from-purple-500/10 via-pink-400/10 to-rose-400/10 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <BookOpen className="h-6 w-6 text-purple-400" />
                        Подборки аниме
                        <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-300">
                          Тематические
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {animeSelections.map((selection) => (
                      <motion.div
                        key={selection.id}
                        whileHover={{ scale: 1.02 }}
                        className="group"
                      >
                        <Card className="h-full bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {selection.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {selection.text}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {selection.fav_count} лайков
                              </div>
                              <div>
                                {new Date(selection.createdAt).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                            {selection.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {selection.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag.id} variant="outline" className="text-xs">
                                    {tag.value.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}