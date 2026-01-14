import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RatingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RatingPopup({ open, onOpenChange }: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!comment.trim()) {
      toast.error("Пожалуйста, напишите отзыв");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          { 
            name: name.trim(), 
            content: comment.trim(),
            rating: rating
          }
        ]);

      if (error) throw error;

      toast.success("Спасибо за ваш отзыв!");
      setRating(0);
      setName("");
      setComment("");
      onOpenChange(false);
      
      // Сохраняем время последнего отзыва
      localStorage.setItem('lastReviewTime', Date.now().toString());
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Ошибка при отправке отзыва");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('lastReviewSkipTime', Date.now().toString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Оцените наш сайт
          </DialogTitle>
          <DialogDescription className="text-center">
            Ваш отзыв поможет нам стать лучше!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Звезды оценки */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-all duration-200"
              >
                <Star
                  className={`h-10 w-10 transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                      : "text-muted-foreground/40"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center text-sm text-muted-foreground"
              >
                {rating === 1 && "Очень плохо 😞"}
                {rating === 2 && "Плохо 😕"}
                {rating === 3 && "Нормально 😐"}
                {rating === 4 && "Хорошо 😊"}
                {rating === 5 && "Отлично! 🎉"}
              </motion.p>
            )}
          </AnimatePresence>
          
          {/* Имя */}
          <Input
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            maxLength={50}
          />
          
          {/* Комментарий */}
          <Textarea
            placeholder="Напишите ваш отзыв..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Позже
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
