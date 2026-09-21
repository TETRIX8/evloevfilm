import { useState } from "react";
import Client from "@gpt4free/g4f.dev";
import { ExternalLink, Film, Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMovies, searchMovies, type MovieData } from "@/services/api";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  movies?: MovieData[];
}

const client = new Client();
const starterMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Привет! Я помогу найти фильм или сериал под ваше настроение. Напишите, например: «хочу мрачный детектив на вечер» или название фильма — я дам рекомендации и ссылки для просмотра на EVLOEVFILM.",
};

function movieUrl(title: string) {
  return `/movie/${encodeURIComponent(title)}`;
}

async function findCandidates(message: string) {
  const exactMatches = await searchMovies(message).catch(() => []);
  if (exactMatches.length) return exactMatches.slice(0, 8);
  return (await fetchMovies("films", "", { sort: "-views", limit: 24 }).catch(() => [])).slice(0, 8);
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: prompt };
    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const candidates = await findCandidates(prompt);
      const catalogue = candidates.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year || "год неизвестен"}) — рейтинг ${movie.kinopoisk_rating || "нет"}`).join("\n");
      const result = await client.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Ты киноконсультант сайта EVLOEVFILM. Отвечай по-русски, кратко и живо. Рекомендуй только фильмы из переданного каталога, не выдумывай названия и факты. Не вставляй внешние ссылки: ссылки на просмотр будут добавлены интерфейсом сайта. Если подборка не идеально совпадает с запросом, честно скажи, что выбрал наиболее близкие варианты." },
          { role: "user", content: `Запрос пользователя: ${prompt}\n\nДоступный каталог EVLOEVFILM:\n${catalogue || "Каталог временно недоступен"}\n\nСделай короткое объяснение выбора и назови 1–3 лучших варианта из этого списка.` },
        ],
      });
      const answer = result?.choices?.[0]?.message?.content || "Вот несколько вариантов из каталога:";
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: answer, movies: candidates.slice(0, 3) }]);
    } catch (error) {
      console.error("AI movie advisor error:", error);
      toast.error("ИИ временно недоступен. Показываю варианты из каталога.");
      const fallback = await findCandidates(prompt).catch(() => []);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: fallback.length ? "Не удалось подключить ИИ, но я нашёл ближайшие варианты в каталоге:" : "Сейчас каталог недоступен. Попробуйте повторить запрос через минуту.", movies: fallback.slice(0, 3) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="page-shell"><Navigation /><main className="content-container pt-28"><section className="surface-panel mx-auto max-w-5xl overflow-hidden"><header className="border-b border-white/[0.08] px-5 py-6 sm:px-7"><p className="section-eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> AI-навигатор по каталогу</p><h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Посоветуй фильм</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">ИИ подбирает варианты из каталога EVLOEVFILM и даёт ссылки на страницы просмотра именно нашего сайта.</p></header><div className="min-h-[52vh] space-y-5 overflow-y-auto bg-black/10 p-5 sm:p-7">{messages.map((item) => <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-3xl ${item.role === "user" ? "w-fit" : "w-full"}`}><div className={`flex items-start gap-3 ${item.role === "user" ? "flex-row-reverse" : ""}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>{item.role === "user" ? <MessageCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span><div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "rounded-tr-md bg-primary text-primary-foreground" : "rounded-tl-md border border-white/[0.08] bg-secondary text-foreground"}`}><p className="whitespace-pre-line">{item.content}</p></div></div>{item.movies?.length ? <div className="mt-3 grid gap-2 pl-12 sm:grid-cols-3">{item.movies.map((movie) => <Link key={`${item.id}-${movie.title}`} to={movieUrl(movie.title)} className="group rounded-xl border border-white/[0.08] bg-background/70 p-2 transition hover:border-primary/50 hover:bg-primary/5"><div className="flex gap-3"><img src={movie.image} alt="" className="h-16 w-11 rounded-lg object-cover" loading="lazy" /><div className="min-w-0"><p className="line-clamp-2 text-xs font-bold group-hover:text-primary">{movie.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{movie.year || ""}{movie.kinopoisk_rating ? ` · ${movie.kinopoisk_rating}` : ""}</p><span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-primary">Смотреть <ExternalLink className="h-3 w-3" /></span></div></div></Link>)}</div> : null}</div></div>)}{isLoading && <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Loader2 className="h-4 w-4 animate-spin" /></span>Подбираю фильмы из каталога…</div>}</div><form onSubmit={handleSubmit} className="border-t border-white/[0.08] p-4 sm:p-5"><div className="flex gap-2"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Например: фантастика с сильной историей…" className="h-12" disabled={isLoading} /><Button type="submit" className="h-12 gap-2 px-4" disabled={isLoading || !message.trim()}><Send className="h-4 w-4" /><span className="hidden sm:inline">Спросить</span></Button></div><p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><Film className="h-3 w-3" /> Ссылки ведут на страницы фильмов внутри EVLOEVFILM.</p></form></section></main></div>;
}
