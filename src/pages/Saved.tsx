import { useEffect, useMemo, useState } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { useFirebaseStorage } from "@/hooks/use-firebase-storage";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Bookmark, Loader2, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Saved() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { user, loading: authLoading } = useFirebaseAuth();
  const { savedItems, loading, loadSavedItems } = useFirebaseStorage();

  useEffect(() => { if (!authLoading && !user) { toast.error("Войдите, чтобы открыть избранное"); navigate("/auth"); } }, [user, authLoading, navigate]);
  const sortedMovies = useMemo(() => [...savedItems].sort((a, b) => { const diff = a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime(); return sortOrder === "asc" ? diff : -diff; }).map((item) => ({ title: item.title, image: item.poster, link: item.url, id: item.id, type: item.type, year: item.year, rating: item.rating, description: item.description })), [savedItems, sortOrder]);

  if (authLoading || !user) return <div className="page-shell grid min-h-screen place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return <div className="page-shell"><Navigation /><main className="content-container pt-28"><header className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-7 sm:flex-row sm:items-end"><div><p className="section-eyebrow">Ваша личная подборка</p><h1 className="section-heading flex items-center gap-3"><Bookmark className="h-6 w-6 text-primary" /> Избранное</h1><p className="mt-3 text-sm text-muted-foreground">{user.displayName || user.email} · {sortedMovies.length} {sortedMovies.length === 1 ? "фильм" : "фильмов"}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="h-10"><SlidersHorizontal className="h-4 w-4" /> <span className="hidden sm:inline">Сначала {sortOrder === "asc" ? "старые" : "новые"}</span></Button><Button variant="outline" size="icon" onClick={loadSavedItems} aria-label="Обновить список"><RefreshCw className="h-4 w-4" /></Button></div></header>{loading ? <div className="grid h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : sortedMovies.length ? <section className="mt-8"><MovieGrid movies={sortedMovies} /></section> : <section className="surface-panel mx-auto mt-10 max-w-lg p-9 text-center"><Bookmark className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 text-lg font-extrabold">Пока здесь пусто</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Сохраняйте фильмы с карточки — они появятся в этой подборке.</p><Button onClick={() => navigate("/")} className="mt-6">Открыть каталог</Button></section>}</main></div>;
}
