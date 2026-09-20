import { Navigation } from "@/components/navigation/Navigation";
import { MovieGrid } from "@/components/MovieGrid";
import { useFirebaseStorage, HistoryItem } from "@/hooks/use-firebase-storage";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Clock3, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function History() {
  const { historyItems, loading, clearHistory } = useFirebaseStorage();
  const handleClearHistory = async () => { if (!window.confirm("Очистить всю историю просмотров?")) return; const success = await clearHistory(); toast[success ? "success" : "error"](success ? "История очищена" : "Не удалось очистить историю"); };
  const formatMovies = (movies: HistoryItem[]) => movies.map((movie) => ({ title: movie.title, image: movie.poster || "/placeholder.svg", link: movie.url, id: movie.id, type: movie.type, year: movie.year, rating: movie.rating, description: `${formatDistanceToNow(movie.watchedAt.toDate(), { addSuffix: true, locale: ru })}` }));
  return <div className="page-shell"><Navigation /><main className="content-container pt-28"><header className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-7 sm:flex-row sm:items-end"><div><p className="section-eyebrow">Ваш путь по каталогу</p><h1 className="section-heading flex items-center gap-3"><Clock3 className="h-6 w-6 text-primary" /> История просмотров</h1><p className="mt-3 text-sm text-muted-foreground">{historyItems.length ? `Здесь — ${historyItems.length} недавних находок.` : "Здесь появятся фильмы, которые вы открывали."}</p></div>{historyItems.length > 0 && <Button variant="outline" onClick={handleClearHistory} className="h-10 border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" />Очистить</Button>}</header>{loading ? <div className="grid h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : historyItems.length ? <section className="mt-8"><MovieGrid movies={formatMovies(historyItems)} /></section> : <section className="surface-panel mx-auto mt-10 max-w-lg p-9 text-center"><Clock3 className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 text-lg font-extrabold">История пока пустая</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Начните просмотр из каталога — мы сохраним его здесь.</p></section>}</main></div>;
}
