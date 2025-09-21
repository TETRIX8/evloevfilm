import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation/Navigation";
import { AnimeTranslationSelectorNew } from "@/components/anime/AnimeTranslationSelectorNew";
import { AnimeSearchItem } from "@/services/anitype-api";

export default function AnimeTranslationSelectNew() {
  const { animeId } = useParams();
  const location = useLocation();
  
  // Получаем данные аниме из state
  const anime = location.state?.anime as AnimeSearchItem;

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
      <main className="pt-20">
        <AnimeTranslationSelectorNew anime={anime} />
      </main>
    </motion.div>
  );
}