import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation/Navigation";
import { AnimePlayerNew } from "@/components/anime/AnimePlayerNew";
import { AnimeSearchItem } from "@/services/anitype-api";

export default function AnimeWatchNew() {
  const { animeId, episodeNum } = useParams();
  const location = useLocation();
  
  // Получаем данные из state
  const stateData = location.state as {
    anime?: AnimeSearchItem;
    episode?: number;
    season?: number;
    playerUrl?: string;
    translationId?: number;
    translation?: { id: number; title: string; type: string; };
  } | null;

  const anime = stateData?.anime;
  const episode = stateData?.episode || (episodeNum ? parseInt(episodeNum) : 1);
  const season = stateData?.season || 1;
  const playerUrl = stateData?.playerUrl;
  const translationId = stateData?.translationId;

  if (!anime) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90"
      >
        <Navigation />
        <main className="container mx-auto pt-24 pb-16 px-4">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Аниме не найдено</h2>
            <p className="text-muted-foreground">
              Не удалось загрузить информацию об аниме. Попробуйте вернуться к списку аниме.
            </p>
          </div>
        </main>
      </motion.div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen"
    >
      <AnimePlayerNew 
        anime={anime}
        episode={episode}
        season={season}
        playerUrl={playerUrl}
        translationId={translationId}
      />
    </motion.div>
  );
}