import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useRatingPopup() {
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Проверяем, был ли пользователь на странице фильма
    const wasOnMoviePage = sessionStorage.getItem('wasOnMoviePage');
    const currentPath = location.pathname;
    
    // Если мы на странице фильма - запоминаем это
    if (currentPath.startsWith('/movie/') || currentPath.startsWith('/anime-watch/')) {
      sessionStorage.setItem('wasOnMoviePage', 'true');
      return;
    }
    
    // Если вернулись на главную после просмотра фильма
    if (wasOnMoviePage === 'true' && currentPath === '/') {
      sessionStorage.removeItem('wasOnMoviePage');
      
      // Проверяем, не показывали ли недавно попап
      const lastReviewTime = localStorage.getItem('lastReviewTime');
      const lastSkipTime = localStorage.getItem('lastReviewSkipTime');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 часа
      const oneHour = 60 * 60 * 1000; // 1 час
      
      // Не показываем если уже оставил отзыв за последние 24 часа
      if (lastReviewTime && now - parseInt(lastReviewTime) < oneDay) {
        return;
      }
      
      // Не показываем если пропустил за последний час
      if (lastSkipTime && now - parseInt(lastSkipTime) < oneHour) {
        return;
      }
      
      // Показываем попап с небольшой задержкой
      const timer = setTimeout(() => {
        setShowRatingPopup(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
  
  return {
    showRatingPopup,
    setShowRatingPopup
  };
}
