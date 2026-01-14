import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/navigation/Navigation";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Review {
  id: string;
  name: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    fetchReviews();
    
    // Подписка на новые отзывы
    const channel = supabase
      .channel('reviews_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          setReviews(current => [payload.new as Review, ...current]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          if (payload.old) {
            setReviews(current => current.filter(r => r.id !== (payload.old as Review).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    setReviews(data || []);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "Tetrixuno") {
      setIsAdmin(true);
      setShowAdminInput(false);
      toast.success("Вы вошли как администратор");
    } else {
      toast.error("Неверный пароль");
    }
    setAdminPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Пожалуйста, выберите оценку");
      return;
    }

    if (!name.trim()) {
      toast.error("Пожалуйста, введите ваше имя");
      return;
    }

    if (!content.trim()) {
      toast.error("Пожалуйста, напишите отзыв");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{ name: name.trim(), content: content.trim(), rating }]);

      if (error) throw error;

      toast.success("Спасибо за ваш отзыв!");
      setName("");
      setContent("");
      setRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Ошибка при отправке отзыва");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Отзыв удален");
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error("Ошибка при удалении отзыва");
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AppWebGLBackground />
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Заголовок */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-cinzel bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              Отзывы о сайте
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(parseFloat(averageRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xl font-semibold">{averageRating}</span>
              <span className="text-muted-foreground">({reviews.length} отзывов)</span>
            </div>
            
            {/* Админ кнопка */}
            {!isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminInput(!showAdminInput)}
                className="text-xs text-muted-foreground"
              >
                Админ
              </Button>
            )}
            
            {showAdminInput && (
              <form onSubmit={handleAdminLogin} className="flex gap-2 justify-center">
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="max-w-[200px]"
                />
                <Button type="submit" size="sm">Войти</Button>
              </form>
            )}
          </div>

          {/* Форма добавления отзыва */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-4">Оставить отзыв</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Звезды */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Ваша оценка:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-all duration-200 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
                <div className="hidden md:block" />
              </div>

              <Textarea
                placeholder="Напишите ваш отзыв о сайте..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />

              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Отправить отзыв
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Список отзывов */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Все отзывы</h2>
            
            <AnimatePresence mode="popLayout">
              {reviews.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-8"
                >
                  Пока нет отзывов. Будьте первым!
                </motion.p>
              ) : (
                reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card/60 backdrop-blur-sm p-5 rounded-xl border border-border/50 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{review.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.created_at), "d MMM yyyy, HH:mm", { locale: ru })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReview(review.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {review.content}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
