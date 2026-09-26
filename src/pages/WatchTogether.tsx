import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/navigation/Navigation";
import { WatchPartyControlOverlay } from "@/components/watch-together/WatchPartyControlOverlay";
import { CreateRoomModal } from "@/components/watch-together/CreateRoomModal";
import { useWatchTogether } from "@/hooks/useWatchTogether";
import { watchTogetherService, WatchRoom } from "@/services/watchTogetherService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Radio,
  Sparkles,
  Play,
  Film,
  Crown,
  Volume2,
  Mic,
  Share2,
  ArrowLeft,
  Plus,
  Tv,
  MessageSquare,
  ShieldCheck,
  Search,
  Clapperboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { fetchMovies, MovieData } from "@/services/api";

export default function WatchTogether() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomCodeFromUrl = searchParams.get("room");
  const navigate = useNavigate();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const {
    peerId,
    currentRoom,
    isHost,
    chatMessages,
    isMicOn,
    speakingPeers,
    syncStatus,
    createRoom,
    joinRoom,
    leaveRoom,
    playMovie,
    pauseMovie,
    seekMovie,
    changeMovie,
    sendChatMessage,
    toggleMic,
    syncPlayer,
  } = useWatchTogether(iframeRef);

  const [inputCode, setInputCode] = useState("");
  const [storedRooms, setStoredRooms] = useState<WatchRoom[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieData[]>([]);

  // Load active rooms and popular movie suggestions
  useEffect(() => {
    const rooms = watchTogetherService.getStoredRooms();
    setStoredRooms(rooms);

    fetchMovies("films", 2026, { limit: 6 }).then((res) => {
      setPopularMovies(res || []);
    });

    const interval = setInterval(() => {
      setStoredRooms(watchTogetherService.getStoredRooms());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto join room if URL contains room code
  useEffect(() => {
    if (roomCodeFromUrl && (!currentRoom || currentRoom.id !== roomCodeFromUrl)) {
      joinRoom(roomCodeFromUrl);
    }
  }, [roomCodeFromUrl, currentRoom, joinRoom]);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setSearchParams({ room: inputCode.trim() });
    joinRoom(inputCode.trim());
  };

  const handleExitActiveRoom = () => {
    leaveRoom();
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-foreground font-sans selection:bg-primary/30">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* ACTIVE ROOM VIEW */}
        {currentRoom ? (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Bar Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExitActiveRoom}
                  className="rounded-2xl gap-2 hover:bg-white/10 text-muted-foreground hover:text-white font-bold"
                >
                  <ArrowLeft className="h-4 w-4" /> Назад к комнатам
                </Button>
                <div className="h-5 w-px bg-white/10" />
                <div>
                  <h1 className="font-display text-lg font-extrabold text-white flex items-center gap-2">
                    {currentRoom.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">Фильм: {currentRoom.movieTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs font-extrabold">
                  <Users className="h-3.5 w-3.5 mr-1" /> {currentRoom.participants.length} Зрителей
                </Badge>
                {isHost && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs font-extrabold">
                    <Crown className="h-3.5 w-3.5 mr-1" /> Вы ведущий
                  </Badge>
                )}
              </div>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-black shadow-[0_0_80px_rgba(229,9,20,0.2)]">
              {currentRoom.iframeUrl ? (
                <iframe
                  ref={iframeRef}
                  src={currentRoom.iframeUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; microphone; camera; encrypted-media"
                  allowFullScreen
                  onLoad={syncPlayer}
                  title={currentRoom.movieTitle}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                  <Clapperboard className="h-16 w-16 text-primary animate-pulse" />
                  <h3 className="text-xl font-black text-white">Ожидание загрузки видео...</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ведущий комнаты выбирает или меняет фильм. Плеер автоматически запустится у всех участников!
                  </p>
                </div>
              )}
            </div>

            {/* Watch Together Control Bar */}
            <WatchPartyControlOverlay
              room={currentRoom}
              isHost={isHost}
              peerId={peerId}
              isMicOn={isMicOn}
              speakingPeers={speakingPeers}
              chatMessages={chatMessages}
              syncStatus={syncStatus}
              onPlay={playMovie}
              onPause={pauseMovie}
              onSeek={seekMovie}
              onToggleMic={toggleMic}
              onSendMessage={sendChatMessage}
              onLeaveRoom={handleExitActiveRoom}
            />
          </div>
        ) : (
          /* ROOM DIRECTORY & LOBBY VIEW */
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-red-950/40 via-[#0f111a] to-[#07080b] p-8 sm:p-12 shadow-[0_0_100px_rgba(229,9,20,0.15)]">
              <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

              <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-3.5 py-1.5 text-xs font-black tracking-widest uppercase gap-2">
                    <Radio className="h-4 w-4 animate-pulse text-red-500" />
                    Совместный просмотр v2.0
                  </Badge>

                  <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
                    Смотрите кино вместе <br />
                    <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                      в реальном времени
                    </span>
                  </h1>

                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
                    Создайте комнату, отправьте код друзьям и наслаждайтесь синхронным просмотром плеера, живым голосовым чатом и быстрыми эмоциями без задержек.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <CreateRoomModal />

                    <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
                      <Input
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Код комнаты..."
                        className="h-12 w-40 rounded-2xl bg-white/5 border-white/15 text-center font-mono text-sm uppercase tracking-wider font-extrabold focus:border-primary"
                        maxLength={8}
                      />
                      <Button
                        type="submit"
                        className="h-12 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold"
                      >
                        Войти
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                      <Tv className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Синхро-плеер</h3>
                    <p className="text-xs text-muted-foreground">Старт, пауза и перемотка у всех одновременно</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      <Mic className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Голосовой чат</h3>
                    <p className="text-xs text-muted-foreground">Разговаривайте во время фильма через микрофон</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Эмоции и чат</h3>
                    <p className="text-xs text-muted-foreground">Отправляйте летающие эмодзи и текстовые реакции</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Без регистрации</h3>
                    <p className="text-xs text-muted-foreground">Мгновенный доступ P2P без сторонних серверов</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Rooms Directory */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-black text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Активные сеансы
                  </h2>
                  <p className="text-xs text-muted-foreground">Комнаты, доступные для подключения</p>
                </div>

                <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground">
                  Доступно комнат: {storedRooms.length}
                </Badge>
              </div>

              {storedRooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Tv className="h-8 w-8" />
                  </div>
                  <h3 className="font-extrabold text-lg text-white">Пока нет активных комнат</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Будьте первым! Создайте комнату для любого фильма и пригласите друзей по ссылке.
                  </p>
                  <CreateRoomModal />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storedRooms.map((room) => (
                    <div
                      key={room.id}
                      className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(229,9,20,0.2)] flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary/20 text-primary border-primary/30 font-mono font-bold text-xs">
                            #{room.id}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-emerald-400" /> {room.participants.length} в сети
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-white group-hover:text-primary transition-colors">
                            {room.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            🎬 {room.movieTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
                          <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Создатель: <strong>{room.hostName}</strong></span>
                        </div>
                      </div>

                      <div className="pt-6">
                        <Button
                          onClick={() => {
                            setSearchParams({ room: room.id });
                            joinRoom(room.id);
                          }}
                          className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 font-extrabold text-white shadow-[0_0_20px_rgba(229,9,20,0.3)] gap-2"
                        >
                          <Play className="h-4 w-4 fill-current" /> Войти и смотреть
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Movie Suggestions for Watch Together */}
            <div className="space-y-6 pt-6">
              <div>
                <h2 className="font-display text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" /> Популярное для совместного просмотра
                </h2>
                <p className="text-xs text-muted-foreground">Запустите комнату в 1 клик</p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularMovies.slice(0, 6).map((movie) => (
                  <div
                    key={movie.title}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-2 transition-all hover:scale-105"
                  >
                    <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 relative">
                      <img
                        src={movie.poster || "/placeholder.svg"}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <CreateRoomModal
                          movieTitle={movie.title}
                          iframeUrl={movie.iframe_url}
                          posterUrl={movie.poster}
                          trigger={
                            <Button size="sm" className="w-full h-8 text-xs font-bold rounded-xl bg-primary">
                              <Radio className="h-3.5 w-3.5 mr-1" /> Смотреть
                            </Button>
                          }
                        />
                      </div>
                    </div>
                    <div className="p-2">
                      <h4 className="font-bold text-xs text-white truncate">{movie.title}</h4>
                      <p className="text-[10px] text-muted-foreground">{movie.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
