interface WatchHistoryItem {
  title: string;
  image: string;
  link: string;
  lastWatched: string;
  progress: number;
}

export const addToWatchHistory = (movie: { title: string; image: string; link: string }) => {
  const history = JSON.parse(localStorage.getItem("watchHistory") || "[]") as WatchHistoryItem[];
  
  // Remove existing entry if present
  const filteredHistory = history.filter(item => item.title !== movie.title);
  
  // Add new entry at the beginning
  filteredHistory.unshift({
    ...movie,
    lastWatched: new Date().toISOString(),
    progress: 0
  });
  
  // Keep only last 20 items
  const limitedHistory = filteredHistory.slice(0, 20);
  
  localStorage.setItem("watchHistory", JSON.stringify(limitedHistory));
};

export const updateWatchProgress = (title: string, progress: number) => {
  const history = JSON.parse(localStorage.getItem("watchHistory") || "[]") as WatchHistoryItem[];
  const updatedHistory = history.map(item => {
    if (item.title === title) {
      return { ...item, progress };
    }
    return item;
  });
  localStorage.setItem("watchHistory", JSON.stringify(updatedHistory));
};

export const getWatchHistory = () => {
  return JSON.parse(localStorage.getItem("watchHistory") || "[]") as WatchHistoryItem[];
};
